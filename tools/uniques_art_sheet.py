# THE UNIQUE ITEMS' OWN PICTURES: a sheet for him, sized for his phone held upright (1080 wide).
#   tsx tools/uniques_art_peek.ts --dump shots/uniques_art/raw
#   python3 tools/uniques_art_sheet.py <batch> <out.png> [in-game shot.png x0,y0,x1,y1]
# <batch>: a key of BATCHES below (which uniques, and a line on what each shows). Each is drawn six times its size in a slot
# as the bag draws one, under the picture it wears today (its base's orange look); then, if a shot of the game is given, that
# part of it: the same pictures as the game itself shows them.
import json
import sys
from PIL import Image, ImageDraw, ImageFont

RAW = 'shots/uniques_art/raw/'
BATCHES = {
    'boots': {
        'title': 'The nine boots, each its own',
        'was': ['boots'],
        'lines': {
            'longecho': 'A tall sea-blue boot banded in silver, and its own echo behind it, twice.',
            'brokenshackles': "A prisoner's worn boot, an iron shackle round it, its chain snapped.",
            'queenstalons': "A carrion bird's leg: her black feathers, a pale ruff, three talons.",
            'dancingshoes': "The prince's pair: black velvet, red heels, gilt buckles.",
            'standingstone': 'Hewn from a standing stone: a ring cut in it, moss on it.',
            'pivot': 'A steel sabaton, a gilt pivot at the ankle for the turn, a spur.',
            'shortway': "Soft violet, its toe curled back on itself, the Warp's cyan round the ankle.",
            'clovenboots': "The demon's leg: red leather, black fur, a cloven hoof, an ember in it.",
            'sprungheels': 'Bound in linen like his wraps, a brass spring coiled under the heel.',
        },
    },
    'jewels': {
        'title': 'The eight amulets and the seven rings',
        'was': ['amulet', 'ring'],
        'lines': {
            'thirdword': 'A gold plate with three sockets for words: two dark, the third lit.',
            'drownedarm': "One of the Colossus's arms, coiled, still dripping.",
            'amalgamsheart': 'A heart of bone and raw flesh, stitched into one with gold.',
            'clockworksongbird': 'A gold bird on its perch, a cog in its wing. It hangs by its winding key.',
            'dogearedpage': 'A worn page on a thong, its corner folded down, one word still bright.',
            'packcollar': "A companion's collar: green leather, spikes, a tag with a paw on it.",
            'prism': "A three-sided crystal: fire's orange, frost's blue, lightning's yellow.",
            'unsignedpact': 'The pact, rolled and sealed in red, singed, the line for a name still bare.',
            'censorsseal': 'A black iron signet, its face red, a black bar struck across it.',
            'quillsband': 'A silver band with a white quill laid over it, ink at its point.',
            'cantorsecho': "Two stones where a ring has one, alike, in Twin's sea-green.",
            'queensglass': "A small round looking-glass under her crown's glass spikes.",
            'ghostwriter': "A ghost-pale band, its head a gold pen's nib with a bead of cyan.",
            'alloyband': 'Gold and steel twisted into one band, one stone of two colours.',
            'companyscrip': 'A brass company token for a head: toothed, a square hole punched in it.',
        },
    },
    'worn': {
        'title': 'The gloves, belts, helmets and armour',
        'was': ['gloves', 'belt', 'hood', 'helm', 'robe', 'armor'],
        'lines': {
            'freehand': 'Violet silk with the fingers cut away: the hand left free.',
            'fleshmancersbrand': 'Grey dead hide sewn with black thread, his brand burning on its back.',
            'halfcarvedhand': 'Pale stone: the thumb and two fingers carved, the rest still the block.',
            'press': 'A plate gauntlet shut into a fist, a gilt spike on every knuckle.',
            'hairtrigger': "An archer's glove, a trap's steel teeth on it, a hair from finger to thumb.",
            'receipt': "A prize fighter's padded glove, red, laced at the wrist.",
            'bloodprice': 'A blood-red belt with two round red flasks hung from it.',
            'kingsknot': "A girdle of rats' tails, tied in the knot that made them one king.",
            'wardenskeys': "The warden's belt, his iron ring and two keys on it.",
            'miserspurse': 'A fat purse, drawn shut and padlocked, coins already getting out.',
            'towline': 'A belt of stout line with a steel tow hook in a brass collar.',
            'twofacedmask': 'One mask, two faces: the pale half smiling, the dark half not.',
            'headsmanshood': "The executioner's tall pointed hood, blood-red, the rope at its neck.",
            'criershush': 'The bell of his brass trumpet as a helmet, gagged with his wine-red cloth.',
            'hollowcrown': 'His antlers on a band of bark bound with briar, and nothing inside.',
            'longodds': 'A plain steel helmet with a great bone die for a crest, sixes up.',
            'polyglotsmantle': 'Five cloths in one mantle, a colour for each word of damage.',
            'physicianscoat': 'His long black waxed coat and cape, his strap of vials across it.',
            'mothswing': "A cloak cut from the grey moth's wings, their rings still on it.",
            'nettleshirt': 'Woven of green nettle stems, leaves on it, one sleeve never finished.',
        },
    },
    'weapons': {
        'title': "The eighteen weapons, three for each hero's own",
        'was': ['greatsword', 'bow', 'staff', 'tome', 'wrench', 'wraps'],
        'lines': {
            'millstone': 'A heavy blade with a millstone for a guard.',
            'windcutter': 'A pale curved blade slotted for the wind, a winged guard, white streamers.',
            'undertow': "A blade the colour of deep water, an anchor's arms for a guard.",
            'rainwalker': 'A storm-grey bow with a rain cloud caught on its tip, raining.',
            'fan': 'Three arrows on the string at once, spread.',
            'poachersbow': "A rough bow with a trap's teeth along it and a snare hung from its tip.",
            'shepherdscrook': "A shepherd's crook, her violet orb kept in the bend of it, and a bell.",
            'tide': 'Driftwood, its head a wave of sea-glass curling over, foam at its lip.',
            'tuningstaff': 'Black and gold, ending in a steel tuning fork with a small orb in it.',
            'ledgerofdebts': 'An account book in green cloth and red hide, the tally cut in its brass plate.',
            'restlesstome': 'The book open and in the air, its leaves lifting, fire streaming off it.',
            'burningverse': 'Charred black and shut, three lines of a verse still burning through it.',
            'secondwhistle': 'Her wrench with two brass whistles tied to it where she carries one.',
            'stickywrench': 'Its jaw clotted with green paste, a vial stuck fast in it.',
            'foremanswrench': 'Striped yellow and black, a gear at its throat, a star on its jaw.',
            'lastround': "His wraps scorched, the front fist alight in the kick's orange fire.",
            'fourthglobe': 'A globe on every knuckle: green, orange, white, and a fourth.',
            'winningstreak': "A champion's wraps with a winner's blue rosette pinned on.",
        },
    },
}

BG = (26, 22, 72)
SLOT = (14, 12, 36)
ORANGE = (255, 154, 60)
PALE = (255, 236, 200)
SOFT = (200, 196, 232)


def font(size):
    return ImageFont.load_default(size=size)


def icon(name, k):
    im = Image.frombytes('RGBA', (32, 32), open(RAW + name + '.rgba', 'rb').read())
    return im.resize((32 * k, 32 * k), Image.NEAREST)


def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for w in text.split(' '):
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def main():
    key, out = sys.argv[1], sys.argv[2]
    shot = sys.argv[3] if len(sys.argv) > 3 else None
    box = tuple(int(v) for v in sys.argv[4].split(',')) if len(sys.argv) > 4 else None
    b = BATCHES[key]
    names = {e['id']: e['name'] for e in json.load(open(RAW + 'list.json'))}
    ids = list(b['lines'].keys())
    W, cols, k = 1080, 3, 6
    cw = W // cols
    slot = 32 * k + 28
    ft, fn, fl, fh = font(40), font(27), font(20), font(24)
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    cells = []
    for i in ids:
        cells.append((i, wrap(probe, names[i], fn, cw - 24), wrap(probe, b['lines'][i], fl, cw - 36)))
    rows = [cells[r:r + cols] for r in range(0, len(cells), cols)]
    row_h = [slot + 14 + max(len(c[1]) for c in row) * 32 + 6 + max(len(c[2]) for c in row) * 25 + 34 for row in rows]
    top = 250 if len(b['was']) == 1 else 270
    game_h = 0
    crop = None
    if shot:
        crop = Image.open(shot).convert('RGB')
        if box:
            crop = crop.crop(box)
        gw = W - 60
        crop = crop.resize((gw, round(crop.height * gw / crop.width)), Image.LANCZOS)
        game_h = crop.height + 110
    H = top + sum(row_h) + game_h + 30
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((30, 28), b['title'], font=ft, fill=PALE)
    # what they all wear today
    wk = 3
    ws = 32 * wk + 16
    wx = 30
    for kind in b['was']:
        d.rectangle([wx, 100, wx + ws - 1, 100 + ws - 1], fill=SLOT, outline=ORANGE, width=3)
        wi = icon('base_' + kind, wk)
        im.paste(wi, (wx + 8, 108), wi)
        wx += ws + 10
    if len(b['was']) == 1:
        d.text((wx + 10, 112), 'Today all %d wear this picture.' % len(ids), font=fh, fill=SOFT)
        d.text((wx + 10, 146), 'Below: a picture of its own for each.', font=fh, fill=SOFT)
    else:
        d.text((30, 100 + ws + 10), 'Today these %d wear one of the pictures above. Below: its own for each.' % len(ids), font=fl, fill=SOFT)
    y = top
    for row, rh in zip(rows, row_h):
        for c, (i, nlines, tlines) in enumerate(row):
            cx = c * cw + cw // 2
            x0 = cx - slot // 2
            d.rectangle([x0, y, x0 + slot - 1, y + slot - 1], fill=SLOT, outline=ORANGE, width=3)
            ic = icon(i, k)
            im.paste(ic, (x0 + 14, y + 14), ic)
            ty = y + slot + 14
            for t in nlines:
                d.text((cx - d.textlength(t, font=fn) / 2, ty), t, font=fn, fill=ORANGE)
                ty += 32
            ty += 6
            for t in tlines:
                d.text((cx - d.textlength(t, font=fl) / 2, ty), t, font=fl, fill=SOFT)
                ty += 25
        y += rh
    if crop:
        d.text((30, y + 10), 'In the game, on your phone', font=fh, fill=PALE)
        d.text((30, y + 44), 'The bag, as the game itself draws it.', font=fl, fill=SOFT)
        im.paste(crop, (30, y + 84))
    im.save(out)
    print(out, im.size)


main()
