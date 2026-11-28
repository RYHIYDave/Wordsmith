"""Floor 2 drawn from its own pictures, no light (to see a piece whole): python3 tools/f2_compose.py out.png X0 Y0 X1 Y1 [--keep] [--grid]
(game pixels; --keep adds the main building, tools/f2_keep.py)"""
import json, sys
from PIL import Image, ImageDraw
sys.path.insert(0,'/tmp/f2w')
R='/home/claude/wordsmith/godot/assets/looks/'
d=json.load(open(R+'floor2.json')); P=json.load(open(R+'floor2_pics.json'))
S=Image.open(R+'floor2.png').convert('RGBA')
out,X0,Y0,X1,Y1=sys.argv[1],*[2*int(v) for v in sys.argv[2:6]]
extra=[]  # (depth, x, y, image, ax, ay) extra stand pictures
swap={}
if '--keep' in sys.argv:
    K=json.load(open(R+'floor2_keep.json')); KS=Image.open(R+K['sheet']).convert('RGBA')
    for e in K['pieces']:
        extra.append((e[6], e[4], e[5], KS.crop((e[0],e[1],e[0]+e[2],e[1]+e[3])), 0, 0))
can=Image.new('RGBA',(X1-X0,Y1-Y0),(12,14,34,255))
def put(img,x,y):
    x=int(round(x)); y=int(round(y))
    if x>X1 or y>Y1 or x+img.width<X0 or y+img.height<Y0: return
    cx=max(0,X0-x); cy=max(0,Y0-y)
    can.alpha_composite(img.crop((cx,cy,img.width,img.height)),(max(x,X0)-X0,max(y,Y0)-Y0))
order={'back':0,'floor':1,'flat':2,'stand':4}
flat=[it for it in d['items'] if it['frames'] and it['layer'] in ('back','floor','flat')]
flat.sort(key=lambda it:order[it['layer']])
for it in flat:
    p=P[it['frames'][0]]; put(S.crop((p[0],p[1],p[0]+p[2],p[1]+p[3])), it['x']*2-p[4], it['y']*2-p[5])
st=[]
for i,it in enumerate(d['items']):
    if it['frames'] and it['layer']=='stand':
        dd=it['d'] if it['d'] is not None else it['y']/16
        if i in swap:
            im,ax,ay=swap[i]
        else:
            p=P[it['frames'][0]]; im=S.crop((p[0],p[1],p[0]+p[2],p[1]+p[3])); ax,ay=p[4],p[5]
        st.append((dd,i,im,it['x']*2-ax,it['y']*2-ay))
for e in extra: st.append((e[0],-1,e[3],e[1]-e[4],e[2]-e[5]))
st.sort(key=lambda t:(t[0],t[1]))
for dd,i,im,x,y in st: put(im,x,y)
if '--grid' in sys.argv:
    dr=ImageDraw.Draw(can)
    for tx in range(0,16):
        for ty in range(64,80):
            sx=(tx-ty)*32; sy=(tx+ty)*16
            if X0<=sx<X1 and Y0<=sy<Y1:
                dr.text(((sx-X0),(sy-Y0)),'%d,%d'%(tx,ty),fill=(255,255,0))
can.save(out)
