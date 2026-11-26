# BASE=<dir of plainstrike.mp4/.json> python3 measure.py <films dir> <out.json> [ids...] [--again]: each film's look measured against
# a plain Strike's film (godot: --cases=m52film:plainstrike, no meld on it), frame for frame from each side's start: the pixels bright
# and strong in colour in the meld's film and not in the plain one (grown a pixel); per side its peak, its sum (area x seconds), and
# how much of the hero's box it covers and for how long
import sys, json, os, subprocess, glob
import numpy as np
d, out = sys.argv[1], sys.argv[2]
ids = [a for a in sys.argv[3:] if not a.startswith('--')] or sorted(os.path.basename(f)[:-4] for f in glob.glob(d + '/*.mp4'))
W, H = 400, 280
HX, HY = 188, 165
res = json.load(open(out)) if os.path.exists(out) else {}
def frames(path):
    p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vf', 'fps=15,scale=400:280:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    return np.frombuffer(p.stdout, dtype=np.uint8).reshape(-1, H, W, 3).astype(np.float32)
def effmask(F):
    mx = F.max(axis=3); mn = F.min(axis=3)
    v = mx / 255.0; s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    return ((v > 0.55) & (s > 0.35)) | (v > 0.9)
def grow(m):
    g = m.copy()
    g[:, 1:, :] |= m[:, :-1, :]; g[:, :-1, :] |= m[:, 1:, :]
    g[:, :, 1:] |= m[:, :, :-1]; g[:, :, :-1] |= m[:, :, 1:]
    return g
BF = frames('' + os.environ.get('BASE', 'base') + '/plainstrike.mp4')
BE = grow(effmask(BF))
BS = {k: v // 2 for k, v in json.load(open('' + os.environ.get('BASE', 'base') + '/plainstrike.json'))['sides'].items()}
bseg = {'front': (BS['front'], BS['behind']), 'behind': (BS['behind'], BS['foe']), 'foe': (BS['foe'], BS['end'])}
for m in ids:
    if m in res and '--again' not in sys.argv:
        continue
    mp, js = d + '/' + m + '.mp4', d + '/' + m + '.json'
    if not os.path.exists(mp) or not os.path.exists(js):
        continue
    F = frames(mp)
    E = effmask(F)
    S = {k: v // 2 for k, v in json.load(open(js))['sides'].items()}
    r = {'sides': {}}
    for name, a0, a1 in [('front', S['front'], S['behind']), ('behind', S['behind'], S['foe']), ('foe', S['foe'], S['end'])]:
        a1 = min(a1, len(F))
        b0, b1 = bseg[name]
        n = []
        cov = []
        for i in range(a0, a1):
            j = min(b0 + (i - a0), b1 - 1)
            e = E[i] & ~BE[j]
            n.append(int(e.sum()))
            cov.append(float(e[HY - 55:HY, HX - 12:HX + 12].mean()))
        n = np.array(n, float)
        sm = np.convolve(n, np.ones(2) / 2, 'same')
        run = best = 0
        for x in cov:
            run = run + 1 if x > 0.5 else 0
            best = max(best, run)
        r['sides'][name] = {'peak': float(sm.max()), 'sum': float(n.sum() / 15.0), 'p90': float(np.percentile(sm, 90)), 'cover_run': best / 15.0,
                            'cover_max': float(max(cov)) if cov else 0.0}
    res[m] = r
    json.dump(res, open(out, 'w'))
    print(m, {k: (round(v['peak']), round(v['sum'])) for k, v in r['sides'].items()}, flush=True)
