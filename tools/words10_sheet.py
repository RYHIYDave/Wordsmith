#!/usr/bin/env python3
"""HIS THREE NEW WORDS, STEP 1: two sheets for the owner's phone, about 1200 wide.

  looks:   docs/mockups/words10/pictures/words3_looks.png: a row for each word (Lasting, Fleeting, Vast): its rune stone as the game
           cuts it (big, and at the game's size), its name in its colour, its six tones; then a still of each of its sides at work in
           the practice room, on her orb, his whirlwind, burning ground, a boost on him, his poison on a monster, and on a monster,
           at the game's size (a game pixel two of the sheet's, as on his other sheets) and again at twice.
  lexicon: docs/mockups/words10/pictures/lexicon28.png: the Lexicon at its lectern on a phone held sideways, all 28 words found,
           open on the longest page: the game's own rows as they are, then each way to lay out its stones, at the game's size and
           at twice, the pick marked.

The stills are the game's own pictures (tools/scenarios/words10_looks.mjs and words10_lexicon.mjs, at five screen pixels a game
pixel): each is taken back to the game's own pixels, then drawn two or four sheet pixels to one, so every pixel stays crisp.
   python3 tools/words10_sheet.py looks <stills dir and prefix, e.g. /dev/shm/w10/s> <out.png>
   python3 tools/words10_sheet.py lexicon <prefix, e.g. /dev/shm/w10/lex> <out.png>"""
import base64
import io
import json
import sys
from PIL import Image, ImageDraw, ImageFont

mode, pre, out = sys.argv[1:4]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (20, 18, 30)
BAND = (30, 27, 44)
PALE, GREY, PINK, GOLD = (240, 232, 214), (176, 170, 196), (255, 122, 168), (255, 210, 122)
huge, big, mid, small, tiny = (ImageFont.truetype(B, 34), ImageFont.truetype(B, 30), ImageFont.truetype(B, 19), ImageFont.truetype(R, 17), ImageFont.truetype(R, 14))
W = 1200
CW, CH = 392, 216
GAP = 6


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def game_pixels(name, cx=None, cy=None, gw=None, gh=None):
    """A picture of the game taken back to its own pixels (one per game pixel), whole or a box about (cx, cy) gw by gh."""
    im = Image.open(name + '.png').convert('RGB')
    note = json.load(open(name + '.json'))
    s = note['screen']['scale'] if 'screen' in note else note['scale']
    full = im.resize((round(im.width / s), round(im.height / s)), Image.NEAREST)
    if cx is None:
        return full, note
    x0, y0 = round(cx - gw / 2), round(cy - gh / 2)
    return full.crop((x0, y0, x0 + gw, y0 + gh)), note


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


def label(im, text):
    dd = ImageDraw.Draw(im)
    tw = dd.textlength(text, font=tiny)
    dd.rectangle((im.width - tw - 10, im.height - 20, im.width, im.height), fill=(12, 10, 18))
    dd.text((im.width - tw - 5, im.height - 19), text, font=tiny, fill=GREY)


def save(blocks):
    H = sum(b.height for b in blocks)
    sheet = Image.new('RGB', (W, H), BG)
    y = 0
    for b in blocks:
        sheet.paste(b, (0, y))
        y += b.height
    sheet.save(out, optimize=True)
    print(out, sheet.size)


# =====================================================================================================================
if mode == 'looks':
    WORDS = {
        'lasting': ('LASTING', 'Int', '#aa8880', ['#1c1412', '#3e2e28', '#6e564c', '#aa8880', '#ecceb0', '#fff4e6'],
                    'old sand at dusk, pale amber where the light is in it (kept clear of the enemy’s gold)', 'an hourglass, its sand held'),
        'fleeting': ('FLEETING', 'Dex', '#f8e4f8', ['#1e1630', '#5a4486', '#b48ce6', '#f8e4f8', '#fff4ff', '#ffffff'],
                     'a lilac so pale at its edge it is nearly white, its body the deeper lilac', 'a feather'),
        'vast': ('VAST', 'Str', '#6e4e2e', ['#140e08', '#2e2214', '#4a3620', '#6e4e2e', '#c4a47e', '#f0e2cc'],
                 'deep earth, and the dust off it', 'rings opening outward from a point'),
    }
    SCENES = {
        'lasting': ['orb', 'whirl', 'ground', 'boost', 'poison', 'monster'],
        'fleeting': ['orb', 'whirl', 'ground', 'boost', 'poison', 'monster'],
        'vast': ['whirl', 'orb', 'ground', 'strike', 'land', 'monster'],
    }
    CAPS = {
        'lasting': [
            'ON HER ORB: sand-light crawls over it, a ring of its sand turns slowly round it; in the half again it lasts, its sand pours out into a heap below',
            'ON HIS WHIRLWIND: each blade leaves a long trail of sand-light that hangs and sifts down; in its longer spin, sand settles round its edge',
            'ON BURNING GROUND: sand-light crawls over the flames; in the time it gives, sand drifts in from the edge in little dunes, burying it as it ends',
            'A BOOST IT GIVES: (here Guarding’s shield) its glow drawn out behind him in a long ribbon of sand-light, rippling, fraying to grains as it lasts on',
            'HIS POISON ON A MONSTER: as hard, for longer: sand-light round it, its sand pouring into a heap at its feet as it runs on',
            'ON A MONSTER: its poison on him lingers: the same sand, in the enemy’s pink and gold',
        ],
        'fleeting': [
            'ON HER ORB: it stutters, lilac after-images of it jumping either side, streaks whipping round it as it pulses faster',
            'ON HIS WHIRLWIND: a stutter of him spinning in lilac, each blade’s edge traced twice behind it, streaks whipping round',
            'ON BURNING GROUND: thin bright tongues lick up all round its edge, sparks shooting up quick and burning out',
            'A BOOST IT GIVES: (a third shorter, a third stronger) lilac after-images of him a step behind him, streaks whipping round him',
            'HIS POISON ON A MONSTER: the same poison in less time: little stars of light popping on it one after another',
            'ON A MONSTER: its poison on him ticks fast: the same, in the enemy’s pink and gold',
        ],
        'vast': [
            'IN FRONT, ON HIS WHIRLWIND: its reach drawn wider, a bank of dust rolled out to its new edge, grit flung past it',
            'IN FRONT, ON HER ORB: its waves reach wider: the floor cracked where its edge was, dust rolled out past it',
            'IN FRONT, ON BURNING GROUND: laid wider, its dust rolled out from the old edge to the new',
            'BEHIND, ON HIS STRIKE: a quarter of the hit splashes on: a ring of earth from the one struck, rocks thrown to each one near',
            'BEHIND, ON HER ORB: the rocks land, a burst of dirt on each one near',
            'ON A MONSTER: its warning drawn wider: its old reach a broken pink ring, pink dust shoved out to the new, gold barbs at the edge',
        ],
    }

    def still(word, scene, which):
        name = f'{pre}_{word}_{scene}'
        note = json.load(open(name + '.json'))
        gw, gh, k = (CW // 2, CH // 2, 2) if which == 'focus' else (CW // 4, CH // 4, 4)
        im, _ = game_pixels(name, note[which]['x'], note[which]['y'], gw, gh)
        return im.resize((gw * k, gh * k), Image.NEAREST)

    def rune(word):
        note = json.load(open(f'{pre}_rune_{word}.json'))
        return Image.open(io.BytesIO(base64.b64decode(note['png'].split(',', 1)[1]))).convert('RGBA')

    blocks = []
    head = Image.new('RGB', (W, 118), BG)
    d = ImageDraw.Draw(head)
    d.text((14, 10), 'HIS THREE NEW WORDS: THEIR LOOKS', font=huge, fill=PALE)
    d.text((14, 56), 'Each word’s rune stone and colours, then stills of it at work in the practice room, on what it changes:', font=small, fill=GREY)
    d.text((14, 80), 'first at the game’s size, then twice as big. Stills only: the film comes next.', font=small, fill=GREY)
    blocks.append(head)
    for word, (name, stat, col, ramp, colour_is, rune_is) in WORDS.items():
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
        for half in (0, 1):
            scenes = SCENES[word][half * 3:half * 3 + 3]
            caps = CAPS[word][half * 3:half * 3 + 3]
            capb = Image.new('RGB', (W, 88), BG)
            d = ImageDraw.Draw(capb)
            for j, cap in enumerate(caps):
                x = 6 + j * (CW + GAP)
                tag, rest = cap.split(': ', 1)
                d.text((x + 2, 6), tag, font=mid if d.textlength(tag, font=mid) <= CW - 4 else small, fill=PINK if tag == 'ON A MONSTER' else PALE)
                for k, ln in enumerate(wrap(d, rest, tiny, CW - 6)[:3]):
                    d.text((x + 2, 32 + 16 * k), ln, font=tiny, fill=GREY)
            blocks.append(capb)
            for which, lab in (('focus', 'game size'), ('close', 'twice')):
                row = Image.new('RGB', (W, CH + GAP), BG)
                for j, scene in enumerate(scenes):
                    im = still(word, scene, which)
                    label(im, lab)
                    row.paste(im, (6 + j * (CW + GAP), 0))
                blocks.append(row)
        blocks.append(Image.new('RGB', (W, 12), BG))
    foot = Image.new('RGB', (W, 66), BG)
    d = ImageDraw.Draw(foot)
    d.text((14, 8), 'Lasting and Fleeting do the same wherever they sit (in front or behind). Every monster’s side is in the enemy’s pink', font=tiny, fill=GREY)
    d.text((14, 26), 'and gold. Each colour is at least 12 from every other word’s (all 28), the melds’, his cyan and the enemy’s pink and gold,', font=tiny, fill=GREY)
    d.text((14, 44), 'as the eye sees colour.', font=tiny, fill=GREY)
    blocks.append(foot)
    save(blocks)

# =====================================================================================================================
elif mode == 'lexicon':
    lex = json.load(open(f'{pre}_lex.json'))
    word = lex['word']
    WAYS = [
        ('rows', 'AS IT IS NOW: THREE ROWS ACROSS THE TOP', False,
         ['The game’s own: three rows of stones across the top, the page under them.',
          'Its page has {room} game pixels of room; {word}’s page needs {need}, so the last of it (ON A DUNGEON) is left off.']),
        ('side', '1. THE STONES IN A BLOCK DOWN THE LEFT', True,
         ['All 28 stones at once, at their own size ({small} across), four across and seven down the left of the half.',
          'The page beside them, the whole height: {room} pixels; the longest page of all needs {most}, so every word’s page fits whole.',
          'One tap opens a word, as now. Nothing to page through, nothing smaller.']),
        ('small', '2. SMALLER STONES IN TIGHTER ROWS', False,
         ['The stones at the game’s touch size ({small} across), a pixel apart, in rows across the top.',
          'Still three rows: the page gets {room} pixels, and {word}’s needs {need}: not enough.']),
        ('pages', '3. ONE ROW, IN PAGES OF STONES', False,
         ['One row of stones across the top, an arrow at each end to turn to the next of {of} pages of seven.',
          'The page gets {room} pixels: every page fits ({most} the longest).',
          'But only seven stones are seen at a time: a word is found by turning pages.']),
    ]
    blocks = []
    head = Image.new('RGB', (W, 120), BG)
    d = ImageDraw.Draw(head)
    d.text((14, 10), 'THE LEXICON, 28 WORDS: WAYS TO LAY OUT ITS STONES', font=big, fill=PALE)
    d.text((14, 54), f'At its lectern in town, on a phone held sideways (the game’s own screen), all 28 words found, every use of each', font=small, fill=GREY)
    d.text((14, 78), f'known, open on {word[0].upper() + word[1:]}, the longest page. The ten new words show their new rune stones.', font=small, fill=GREY)
    blocks.append(head)
    for way, title, pick, lines in WAYS:
        name = f'{pre}_way_{way}'
        note = json.load(open(name + '.json'))
        im, _ = game_pixels(name)
        half = im.crop((0, 0, 254, 234))
        vals = {'room': note['page']['h'], 'need': note['need'], 'most': note['most'][1], 'word': word[0].upper() + word[1:], 'small': note['small'], 'of': (note['arrows'] or {}).get('of', 1)}
        tb = Image.new('RGB', (W, 46), BAND if not pick else (40, 34, 24))
        d = ImageDraw.Draw(tb)
        d.text((14, 9), title, font=mid, fill=PALE)
        if pick:
            tw = d.textlength(title, font=mid)
            d.rectangle((14 + tw + 16, 8, 14 + tw + 16 + 126, 36), fill=GOLD)
            d.text((14 + tw + 26, 11), 'MY PICK', font=mid, fill=(30, 20, 10))
        blocks.append(tb)
        row = Image.new('RGB', (W, 468 + 12), BG)
        gs = half.resize((508, 468), Image.NEAREST)
        label(gs, 'game size')
        row.paste(gs, (6, 6))
        d = ImageDraw.Draw(row)
        y = 14
        for ln in lines:
            for part in wrap(d, ln.format(**vals), small, W - 540):
                d.text((530, y), part, font=small, fill=PALE if pick else GREY)
                y += 24
            y += 8
        blocks.append(row)
        if way != 'rows':
            tw2 = half.resize((1016, 936), Image.NEAREST)
            label(tw2, 'twice')
            r2 = Image.new('RGB', (W, 936 + 16), BG)
            r2.paste(tw2, (6, 4))
            blocks.append(r2)
    foot = Image.new('RGB', (W, 60), BG)
    d = ImageDraw.Draw(foot)
    d.text((14, 8), 'Every stone is at least the game’s touch size (18 game pixels across: a button’s height with fingers). The shelf of', font=tiny, fill=GREY)
    d.text((14, 26), 'kept words along the foot is as it is now.', font=tiny, fill=GREY)
    blocks.append(foot)
    save(blocks)
