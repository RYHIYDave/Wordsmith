import sys
from PIL import Image, ImageDraw, ImageFont
old, new, out = sys.argv[1], sys.argv[2], sys.argv[3]
W = 1266
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font = ImageFont.truetype(B, 26)
def crop(path, box, s):
    im = Image.open(path).convert('RGB').crop(box)
    return im.resize((im.width * s, im.height * s), Image.NEAREST)
def box(cx, cy, w, h):
    return (cx - w // 2, cy - h // 2, cx - w // 2 + w, cy - h // 2 + h)
def pair(left, right, name, labels):
    h = max(left.height, right.height)
    im = Image.new('RGB', (W, h), (23, 20, 46))
    im.paste(left, (0, 0)); im.paste(right, (W - right.width, 0))
    d = ImageDraw.Draw(im)
    for x, text in ((10, labels[0]), (W - right.width + 10, labels[1])):
        d.rectangle((x - 6, 6, x + d.textlength(text, font=font) + 6, 42), fill=(23, 20, 46))
        d.text((x, 9), text, font=font, fill=(255, 216, 102))
    im.save(f'{out}/{name}'); print(name, im.size)
pair(crop(f'{old}/b_room0_after.png', box(1062, 392, 210, 190), 3), crop(f'{new}/b_room0_after.png', box(1062, 392, 210, 190), 3), 'gargoyle_before_after.png', ('first', 'smaller, higher'))
pair(crop(f'{old}/b_room0_after.png', box(1488, 402, 210, 190), 3), crop(f'{new}/b_room0_after.png', box(1488, 402, 210, 190), 3), 'tapestry_before_after.png', ('first', 'torn and burnt'))
im = crop(f'{new}/c_room11_after.png', (960, 270, 960 + 633, 270 + 400), 2); im.save(f'{out}/room11_new.png'); print('room11_new.png', im.size)
