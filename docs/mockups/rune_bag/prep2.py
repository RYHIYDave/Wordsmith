import json, sys, base64, io
from PIL import Image
S = sys.argv[1]; D = S + '/data/'
hud = json.load(open(D + 'hud.json')); hp = Image.open(D + 'hud.png').convert('RGBA')
icons = {e['key']: e for e in json.load(open(D + 'icons.json'))}; at = Image.open(D + 'icons.png').convert('RGBA')
def uri(im, fmt='PNG', **kw):
    b = io.BytesIO(); im.save(b, fmt, **kw); return f'data:image/{fmt.lower()};base64,' + base64.b64encode(b.getvalue()).decode()
pics = {}
for k in ['ability:strike', 'ability:whirl', 'ability:leap', 'gold', 'meldstone']:
    x, y, w, h = hud["pics"][k][:4]; pics[k] = dict(u=uri(hp.crop((x, y, x + w, y + h))), w=w, h=h)
for k in ['helm:1', 'ring:2', 'boots:0', 'amulet:2', 'gloves:1', 'greatsword:2', 'belt:1', 'potion']:
    e = icons[k]; pics[k] = dict(u=uri(at.crop((e['x'], e['y'], e['x'] + e['w'], e['y'] + e['h']))), w=e['w'], h=e['h'])
bg = Image.open(S + '/now_01_gear.png').convert('RGB')
W, H = bg.size  # 1688x780 at dpr2 of 844x390
half = bg.crop((0, 0, W // 2, H))
cw = int(H * 480 / 540); x0 = (W // 2 - cw) // 2
world = half.crop((x0, 0, x0 + cw, H)).resize((480, 540), Image.LANCZOS)
pics['world'] = dict(u=uri(world, 'JPEG', quality=78), w=480, h=540)
json.dump(pics, open(S + '/mock/pics.json', 'w'))
print({k: (v['w'], v['h'], len(v['u'])) for k, v in pics.items()})
