# THE KEY-BEARERS SHEET: lays out the pixels of tools/key_bearers_sheet.ts at 4x, captioned, on one floor line.
#   python3 tools/key_bearers_sheet.py <in.json> <out.png>
import json,sys
from PIL import Image, ImageDraw, ImageFont
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
d=json.load(open(sys.argv[1])); S=4
names=['THE BRAWLER\n(for size)','DAGGER CULTIST','KEYBEARER OF\nTHE KNIFE','behind','KEYBEARER OF\nTHE FLAME','behind']
top=95; bot=22; half=46
cells=[]
for f,nm in zip(d,names):
    w,h=f['w'],f['h']
    x0=f['ax']-half; x1=f['ax']+half; y0=f['ay']-top; y1=f['ay']+bot
    im=Image.new('RGB',((x1-x0)*S,(y1-y0)*S+66),(38,34,58)); dr=ImageDraw.Draw(im)
    # floor line
    dr.rectangle([0,66+top*S,im.size[0],66+top*S+1],fill=(58,52,84))
    for i,c in enumerate(f['px']):
        if c:
            x,y=i%w,i//w
            if x0<=x<x1 and y0<=y<y1: dr.rectangle([(x-x0)*S,66+(y-y0)*S,(x-x0)*S+S-1,66+(y-y0)*S+S-1],fill=c[:7])
    dr.multiline_text((10,6),nm,font=F,fill=(232,246,255))
    cells.append(im)
W=sum(c.size[0] for c in cells); H=max(c.size[1] for c in cells)
s=Image.new('RGB',(W,H),(38,34,58)); x=0
for c in cells: s.paste(c,(x,0)); x+=c.size[0]
s.save(sys.argv[2]); print(s.size)
