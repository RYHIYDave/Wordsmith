# Lays the raw pictures of tools/eight_sides_raw.ts out as sheets to be read on a phone held sideways (wider than tall,
# whole screen pixels to a picture pixel, a caption under each). Not in the game.
#   python3 tools/eight_sides_sheet.py row <dir> <prefix> <out.png> [scale] [title]
import sys
from PIL import Image, ImageDraw, ImageFont

SIDES = ['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side']
NAMES = {
    'front': 'down-right', 'toward': 'toward you', 'frontL': 'down-left', 'sideL': 'left',
    'backL': 'up-left', 'away': 'away', 'back': 'up-right', 'side': 'right',
}
HAS = {'front': 'drawn today', 'back': 'drawn today'}
BG = (23, 20, 46)
PANEL = (38, 35, 84)
TEXT = (228, 224, 255)
SOFT = (168, 162, 216)
GOLD = (255, 216, 102)
CYAN = (40, 220, 240)


def font(size):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf']:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def bbox_all(ims):
    box = None
    for im in ims:
        b = im.getbbox()
        if b is None:
            continue
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    return box


def row(d, prefix, out, scale=4, title='', sides=SIDES, new_mark=True):
    ims = [Image.open(f'{d}/{prefix}_{s}.png').convert('RGBA') for s in sides]
    x0, y0, x1, y1 = bbox_all(ims)
    pad = 6
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(ims[0].width, x1 + pad), min(ims[0].height, y1 + pad)
    cw, ch = (x1 - x0) * scale, (y1 - y0) * scale
    gap = 10
    cap = 58
    top = 64 if title else 16
    W = gap + len(sides) * (cw + gap)
    H = top + ch + cap + gap
    sheet = Image.new('RGB', (W, H), BG)
    g = ImageDraw.Draw(sheet)
    if title:
        g.text((gap, 16), title, font=font(30), fill=GOLD)
    for i, (s, im) in enumerate(zip(sides, ims)):
        x = gap + i * (cw + gap)
        g.rectangle([x, top, x + cw - 1, top + ch + cap - 1], fill=PANEL)
        c = im.crop((x0, y0, x1, y1)).resize((cw, ch), Image.NEAREST)
        sheet.paste(c, (x, top), c)
        g.text((x + 8, top + ch + 4), NAMES[s], font=font(22), fill=TEXT)
        if new_mark:
            g.text((x + 8, top + ch + 30), HAS.get(s, 'NEW'), font=font(18), fill=SOFT if s in HAS else CYAN)
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__':
    if sys.argv[1] == 'row':
        row(sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5]) if len(sys.argv) > 5 else 4, sys.argv[6] if len(sys.argv) > 6 else '')


def grid(d, names, out, scale=2, sides=SIDES, crop=None):
    """Rows of moves, a column a side: for looking over (not for him)."""
    rows = []
    for n in names:
        ims = [Image.open(f'{d}/{n}_{s}.png').convert('RGBA') for s in sides]
        rows.append((n, ims))
    box = bbox_all([im for _, ims in rows for im in ims])
    x0, y0, x1, y1 = box
    pad = 4
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    cw, ch = (x1 - x0 + pad) * scale, (y1 - y0 + pad) * scale
    W = 90 + len(sides) * cw
    H = 26 + len(rows) * ch
    sheet = Image.new('RGB', (W, H), BG)
    g = ImageDraw.Draw(sheet)
    for i, s in enumerate(sides):
        g.text((90 + i * cw + 6, 4), NAMES[s], font=font(14), fill=TEXT)
    for r, (n, ims) in enumerate(rows):
        g.text((4, 26 + r * ch + 6), n, font=font(13), fill=GOLD)
        for i, im in enumerate(ims):
            c = im.crop((x0, y0, x1 + pad, y1 + pad)).resize((cw, ch), Image.NEAREST)
            sheet.paste(c, (90 + i * cw, 26 + r * ch), c)
    sheet.save(out)
    print(out, sheet.size)


if __name__ == '__main__' and sys.argv[1] == 'grid':
    grid(sys.argv[2], sys.argv[3].split(','), sys.argv[4], int(sys.argv[5]) if len(sys.argv) > 5 else 2)
