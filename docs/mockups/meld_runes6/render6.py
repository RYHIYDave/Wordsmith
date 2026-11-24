# Draws the 110 meld runes of the High City (their runes.json made by tools/meldshigh/design.py) with ../meld_runes/render.py's own stone(), writes stones/<id>.png (12 x 12) and runes.json, and a
# review sheet: python3 render5.py review.png
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
R6 = json.load(open(HERE + '/runes.json'))
os.chdir(HERE + '/../meld_runes')
src = open('render.py').read().split("if __name__=='__main__':")[0]
env = {}
exec(src, env)
env['R'].update(R6)
os.chdir(HERE)
from PIL import Image, ImageDraw, ImageFont
for k in R6:
    env['stone'](k).save('stones/%s.png' % k)
if len(sys.argv) > 1:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    ids = list(R6); sc = 8; cw = 150; ch = 12 * sc + 40; cols = 8
    rows = (len(ids) + cols - 1) // cols
    out = Image.new('RGBA', (cols * cw + 10, rows * ch + 10), (14, 12, 36, 255)); dr = ImageDraw.Draw(out)
    for i, k in enumerate(ids):
        x = 10 + (i % cols) * cw; y = 10 + (i // cols) * ch
        s = env['stone'](k).resize((12 * sc, 12 * sc), Image.NEAREST); out.paste(s, (x + (cw - 12 * sc) // 2 - 5, y), s)
        dr.text((x, y + 12 * sc + 4), R6[k]['name'], font=font, fill=(220, 224, 250))
    out.save(sys.argv[1])
print(len(R6), 'stones')
