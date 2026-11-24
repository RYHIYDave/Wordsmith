# Draws the 45 meld runes of Floor 11-15 Melds with ../meld_runes/render.py's own stone(), writes stones/<id>.png (12 x 12) and runes.json, and a
# review sheet: python3 render2.py review.png
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(HERE + '/design.py').read())
os.chdir(HERE + '/../meld_runes')
src = open('render.py').read().split("if __name__=='__main__':")[0]
env = {}
exec(src, env)
env['R'].update(R3)
os.chdir(HERE)
from PIL import Image, ImageDraw, ImageFont
for k in R3:
    env['stone'](k).save('stones/%s.png' % k)
json.dump(R3, open('runes.json', 'w'), indent=1)
if len(sys.argv) > 1:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    ids = list(R3); sc = 8; cw = 150; ch = 12 * sc + 40; cols = 8
    rows = (len(ids) + cols - 1) // cols
    out = Image.new('RGBA', (cols * cw + 10, rows * ch + 10), (14, 12, 36, 255)); dr = ImageDraw.Draw(out)
    for i, k in enumerate(ids):
        x = 10 + (i % cols) * cw; y = 10 + (i // cols) * ch
        s = env['stone'](k).resize((12 * sc, 12 * sc), Image.NEAREST); out.paste(s, (x + (cw - 12 * sc) // 2 - 5, y), s)
        dr.text((x, y + 12 * sc + 4), R3[k]['name'], font=font, fill=(220, 224, 250))
    out.save(sys.argv[1])
print(len(R3), 'stones')
