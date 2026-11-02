# THE THREE FIXES' SHEET (docs/mockups/action_fixes/pictures/action_fixes_sheet.png): each fix's old beside its new at the same
# scale (the old: stills of the branch before, art/action-f16 8fafbbf, made by its own film tools at the same zoom), and the key
# moments of each, with plain captions. The new cells are the film's own frames (tools/action_fixes_sheet.ts).
#   python3 tools/action_fixes_sheet.py <new cells dir> <old stills dir> <out.png>
import sys
from PIL import Image, ImageDraw, ImageFont

new, old, out = sys.argv[1], sys.argv[2], sys.argv[3]
W = 1200
CW, CH = 600, 338
BG = (10, 8, 14)
INK = (240, 232, 208)
DIM = (200, 194, 214)
PINK = (255, 122, 168)
bold = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
head = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
body = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)


def cell(path, crop=None):
    im = Image.open(path).convert('RGB')
    if crop:
        im = im.crop(crop)
        return im.resize((CW, CH), Image.NEAREST)
    return im.resize((CW, CH), Image.BOX)


blocks = []


def title(text, sub):
    im = Image.new('RGB', (W, 92), BG)
    d = ImageDraw.Draw(im)
    d.text((18, 14), text, font=bold, fill=PINK)
    d.text((18, 52), sub, font=body, fill=DIM)
    blocks.append(im)


def row(a, ca, b, cb, tag_a=None, tag_b=None):
    im = Image.new('RGB', (W, CH + 34), BG)
    im.paste(a, (0, 0))
    im.paste(b, (CW, 0))
    d = ImageDraw.Draw(im)
    d.line([(CW - 1, 0), (CW - 1, CH)], fill=BG, width=3)
    for x, tag, cap in ((0, tag_a, ca), (CW, tag_b, cb)):
        if tag:
            tw = d.textlength(tag, font=head)
            d.rectangle([x + 10, 10, x + 24 + tw, 40], fill=(7, 6, 12))
            d.text((x + 17, 13), tag, font=head, fill=PINK if tag == 'NOW' else DIM)
        d.text((x + 12, CH + 7), cap, font=body, fill=INK)
    blocks.append(im)


N = lambda n, crop=None: cell(f'{new}/{n}.png', crop)
O = lambda n, crop=None: cell(f'{old}/{n}', crop)
ARENA = (250, 220, 850, 558)

title('THREE FIXES FROM THIS MORNING’S FILMS', 'Each one as it was beside how it is now, at the same size; then its key moments. The knight is there for size.')

title('1 · THE CARRION QUEEN’S DIVE', '“The carrion queen’s dive should be a much bigger AOE, and really sell it with dirt and dust on the impact.”')
row(O('q/p4_1.20.png'), 'Before: the ground she strikes, 3.2 tiles across', N('q_held'), 'Now: 6.4 tiles across, marked plain while she hangs', 'BEFORE', 'NOW')
row(O('q/p4_1.90.png'), 'Before: a small crater, a little dust', N('q_hit'), 'Now: the rock bursts, dust rolling out to the edge', 'BEFORE', 'NOW')
row(N('q_fountain'), 'The strike: a fountain of rock and dirt', N('q_ring'), 'The ring of dust out to the edge of the area')
row(N('q_hang'), 'The dust hangs and drifts off (from behind)', N('q_crater'), 'The crater and its cracks, left a moment')

title('2 · THE RAT KING', '“The sluice gates should just open periodically ... Just an arena hazard.”  And his roll: “His roll, back and bigger”')
row(O('rk/p4_1.40.png'), 'Before: he reared up to open the sluices', N('rk_marked', ARENA), 'Now: they open on their own while he fights', 'BEFORE', 'NOW')
row(O('rk/p4_2.40.png'), 'Before: the flood, his move', N('rk_flood', ARENA), 'Now: the flood, while he spits a word', 'BEFORE', 'NOW')
row(O('oldroll_0.50.png'), 'His old roll: curled, a lane 1.5 wide', N('rk_held'), 'Now: curled, spinning up, HELD; a lane 2.4 wide', 'BEFORE', 'NOW')
row(O('oldroll_1.20.png'), 'His old roll: 6.45 tiles a second', N('rk_run'), 'Now: 13 tiles a second', 'BEFORE', 'NOW')
row(N('rk_strike'), 'Off the line in 2 frames', N('rk_open'), 'He bursts open where he stops: a ring 2.2 round')
row(N('rk_rollmarks', ARENA), 'From above: his lane, and the lanes marked again', N('rk_rollflood', ARENA), 'Back up on the ledge before the gates burst')

title('3 · THE TWISTED DEER’S BRAMBLE CHARGE', '“I’m not in love with the bramble charge from the deer.”  His pick: “Redo hedge and gallop”')
row(O('d/p0_1.60.png'), 'Before: it kept its standing shape', N('d_gallop'), 'Now: a full gallop, low and long', 'BEFORE', 'NOW')
row(O('d/p0_2.40.png'), 'Before: a pile of pale sticks', N('d_hedge'), 'Now: dark living bramble, hooked thorns', 'BEFORE', 'NOW')
row(N('d_stretch', (150, 150, 750, 488)), 'Stretched out: legs far in front and far behind', N('d_gather', (330, 150, 930, 488)), 'Gathered under it, mud kicked up')
row(N('d_rise'), 'The bramble writhing up out of the ground', N('d_wither'), 'After 4 seconds it withers back')

H = sum(b.height for b in blocks)
sheet = Image.new('RGB', (W, H), BG)
y = 0
for b in blocks:
    sheet.paste(b, (0, y))
    y += b.height
sheet.save(out, optimize=True)
print(out, sheet.size)
