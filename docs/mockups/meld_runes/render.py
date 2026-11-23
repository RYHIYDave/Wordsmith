import json, sys
from PIL import Image, ImageDraw, ImageFont
exec(open('design.py').read())
G='/home/user/Wordsmith/godot/assets/loot/'
d={p['key']:p for p in json.load(open(G+'icons.json'))}
sheet=Image.open(G+'icons.png').convert('RGBA')
colors=json.load(open(G+'items.json'))['words']['color']
FACE=(101,88,104,255); GROOVE=(58,48,64,255)
def grid(k):
    p=d['word:'+k]; return [[sheet.getpixel((p['x']+2*x,p['y']+2*y)) for x in range(12)] for y in range(12)]
blank=grid('power')
for y in range(2,10):
    for x in range(2,10): blank[y][x]=FACE
def hexc(h): h=h.lstrip('#'); return (int(h[0:2],16),int(h[2:4],16),int(h[4:6],16),255)
def glow(h):
    c=hexc(h); return tuple(int(c[i]+(255-c[i])*0.55) for i in range(3))+(255,)
def stone(id):
    r=R[id]; S=[row[:] for row in blank]; g=r['glyph']; n=len(g)
    on=lambda x,y: 0<=y<n and 0<=x<n and g[y][x]!='.'
    for y in range(n):
        for x in range(n):
            if not on(x,y): continue
            if not on(x,y-1): S[2+y][3+x]=GROOVE
            if not on(x-1,y): S[3+y][2+x]=GROOVE
    for y in range(n):
        for x in range(n):
            if on(x,y): S[3+y][3+x]= glow(r['color']) if g[y][x]=='o' else hexc(r['color'])
    for x in (2,3,4): S[10][x]=hexc(colors[r['of'][0]])
    for x in (7,8,9): S[10][x]=hexc(colors[r['of'][1]])
    im=Image.new('RGBA',(12,12))
    for y in range(12):
        for x in range(12): im.putpixel((x,y),S[y][x])
    return im
def base(w):
    p=d['word:'+w]; return sheet.crop((p['x'],p['y'],p['x']+24,p['y']+24)).resize((12,12),Image.NEAREST)
if __name__=='__main__':
    font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
    ids=list(R)
    sc=8; cw=150; ch=12*sc+40; cols=8
    rows=(len(ids)+cols-1)//cols
    out=Image.new('RGBA',(cols*cw+10,rows*ch+10),(14,12,36,255)); dr=ImageDraw.Draw(out)
    for i,k in enumerate(ids):
        x=10+(i%cols)*cw; y=10+(i//cols)*ch
        s=stone(k).resize((12*sc,12*sc),Image.NEAREST); out.paste(s,(x+(cw-12*sc)//2-5,y),s)
        dr.text((x,y+12*sc+4),R[k]['name'],font=font,fill=(220,224,250))
    out.save(sys.argv[1] if len(sys.argv)>1 else 'review.png')
