#!/usr/bin/env python3
"""THE SWAMP COLOSSUS'S MOVES, PART 2: HIS TENTACLES, FOR THE OWNER'S PHONE (art/eye_arms.ts; a mock-up, not in the game): from the
frames tools/eye_moves_pics.ts lays together (the phone's screen, 1014 x 468 picture pixels, two to a game pixel):
   python3 tools/eye_arms_sheet.py sheet <frames dir> <out.png>    key frames of each move, at the game's size and at twice
   python3 tools/eye_arms_sheet.py film <frames dir> <out.mp4>     phase 1 (his lurk, the two); phase 2 (his stand, the three: a slam
                                                                   on the stone, the water slams left, right and both with the crash)
                                                                   at full speed; the crash again at half speed; a slam close up
(the shots' frames as art/eye_arms.ts SHOT_P1 and SHOT_P2 set them; each move's timing as SLAM, SMASH, FLINCH, DEATH, CRASH_AT)
"""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
from eye_moves_sheet import BG, PALE, GREY, PINK, W, big, mid, small, wrap, block, row, caption_bar

FPS = 30
# (art/eye_arms.ts: a slam's and a water slam's frames from its start; a flinch; a death)
WIND, HIT, LIE, DOWN, FRAMES = 27, 28, 15, 30, 74
FLINCH = 14
CONVULSE, THRASH, SINK = 20, 22, 48
CRASH_AT = 46.6  # frames from the both-at-once smash to the waves meeting (CRASH_AT, 1.55 s)
# (the shots: each tentacle's doings, frame it begins)
P1_FRAMES, P2_FRAMES = 380, 520
P1 = {'A': {'burst': 0, 'slams': [40, 160]}, 'B': {'burst': 6, 'slams': [100, 222], 'struck': 253, 'death': 263}}
P2 = {'slam': 30, 'left': [112, 322], 'right': [212, 322], 'run': (100, 150)}


def frame(d, move, k):
    return Image.open(os.path.join(d, '%s_%03d.png' % (move, k))).convert('RGB')


def slam_beat(f, who, wh):
    """A slam's beat at its frame `f` (None outside it)."""
    if f < 0 or f >= FRAMES: return None
    if f < WIND: return (3, '%s WIND-UP, HELD 0.9 s: %s rears back, coiling, quivering; its line on the stone' % (wh, who))
    if f < HIT + LIE: return (5, '%s STRIKE (2 smeared frames), THE HIT: along the line, the stone cracked, the screen jolted' % wh)
    return (2, '%s WIND-DOWN: dragged back, scraping, peeling off the stone, a slime trail fading' % wh)


def beat1(k):
    """What is happening at a frame of phase 1."""
    bs = []
    if k < 10: bs.append((1, 'PHASE 1: his lurk; the water bulging over his two tentacles'))
    elif k < 40: bs.append((3, 'PHASE 1: his two tentacles BURST UP out of his lurk at the thirds; then their stand, never still'))
    for who, A in (('the left one', P1['A']), ('the right one', P1['B'])):
        for i, s in enumerate(A['slams']):
            b = slam_beat(k - s, who, 'SLAM %s:' % ('1' if i == 0 else '2'))
            if b: bs.append(b)
    B = P1['B']
    if B['struck'] <= k < B['death']: bs.append((6, 'STRUCK as it lies: a big flinch, his dark ichor spurting'))
    if B['death'] <= k < B['death'] + CONVULSE: bs.append((7, 'STRUCK ITS LAST: it convulses (held)'))
    elif B['death'] + CONVULSE <= k < B['death'] + CONVULSE + THRASH: bs.append((7, 'IT DIES: thrashing'))
    elif B['death'] + CONVULSE + THRASH <= k < B['death'] + CONVULSE + THRASH + SINK: bs.append((7, 'IT SINKS back into the water, coiling; bubbles, a slick of ichor'))
    elif k >= B['death'] + CONVULSE + THRASH + SINK: bs.append((1, 'gone under: the water closing over it'))
    if not bs: bs.append((0, 'their stand: swaying, coiling, tips curling, suckers flexing, slime dripping'))
    return max(bs)[1]


def beat2(k):
    """What is happening at a frame of phase 2."""
    bs = []
    if k < P2['slam']: bs.append((0, 'PHASE 2: his stand with his three tentacles'))
    b = slam_beat(k - P2['slam'], 'the middle one', 'A SLAM:')
    if b: bs.append(b)
    if P2['run'][0] <= k < P2['run'][1]: bs.append((1, 'the Warrior runs to the front of the stone, out of the waves\' reach'))
    for name, ks, dirn in (('LEFT', P2['left'], 'right'), ('RIGHT', P2['right'], 'left')):
        for k0 in ks:
            both = k0 == 322
            f = k - k0
            nm = 'BOTH' if both else name
            if 0 <= f < WIND: bs.append((3, '%s WATER SLAM, WIND-UP, HELD 0.9 s: rearing back, coiling; the warning on the stone' % nm))
            elif WIND <= f < HIT + 4: bs.append((5, ('BOTH: STRIKE, SMASH into the water off both ends of the stone' if both else '%s: STRIKE, SMASH into the water off the stone\'s %s end' % (nm, name.lower()))))
            elif HIT + 1 <= f < HIT + 40 and not both: bs.append((4, '%s: a wave rolls %s across the stone, tallest at the back, dying before the front' % (nm, dirn)))
            elif both and HIT + 1 <= f < HIT + CRASH_AT: bs.append((4, 'BOTH: the two waves race in from the ends'))
            elif both and HIT + CRASH_AT <= f < HIT + CRASH_AT + 52: bs.append((6, 'THE CRASH as they meet: a column of water, spray and slime, falling back across the stone'))
            elif HIT + 1 <= f < FRAMES: bs.append((1, '%s: the tentacle drawn back up out of the water' % nm))
    if not bs: bs.append((0, 'his stand with his three tentacles: the stone left wet and streaming'))
    return max(bs)[1]


def crop_slam(f):
    """The close-up of the left one's first slam in phase 1 (507 x 234 picture pixels, twice the size fills the screen), at frame `f` of
    the slam: on its coil as it rears and holds, panning down onto the stone for the strike, the hit and the wind-down."""
    t = max(0.0, min(1.0, (f - 14) / 12.0))
    y0 = round(60 + 170 * t * t * (3 - 2 * t))
    return (147, y0, 654, y0 + 234)


def film(d, out):
    seq = []
    for k in range(P1_FRAMES): seq.append(('p1', k, 'PHASE 1: HIS LURK AND HIS TWO TENTACLES, FULL SPEED', beat1(k), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    for k in range(P2_FRAMES): seq.append(('p2', k, 'PHASE 2: HIS STAND AND HIS THREE, FULL SPEED', beat2(k), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    for k in range(322, 462):
        for _ in range(2): seq.append(('p2', k, 'BOTH AT ONCE AND THE CRASH, HALF SPEED', beat2(k), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    s = P1['A']['slams'][0]
    for k in range(s - 6, s + FRAMES + 2):
        for _ in range(2): seq.append(('p1', k, 'A SLAM ON THE STONE, CLOSE UP, HALF SPEED', beat1(k), 'frame %d  |  %.2f s' % (k - s, (k - s) / FPS), True))
    w, h = 1014, 468 + 72
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (w, h), '-framerate', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    cache = {}
    for (move, k, title, line, foot, close) in seq:
        key = (move, k, close)
        if key not in cache:
            if len(cache) > 300: cache.clear()
            im = frame(d, move, k)
            if close: im = im.crop(crop_slam(k - P1['A']['slams'][0])).resize((1014, 468), Image.NEAREST)
            cache[key] = im
        f = Image.new('RGB', (w, h), BG)
        f.paste(cache[key], (0, 0))
        bar = caption_bar(w, title, line, foot)
        f.paste(bar, (0, 468))
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    print(out, len(seq), 'frames', '%.1f s' % (len(seq) / FPS))


def tile(d, move, k, cx, cy, wd=500, ht=300):
    """A part of the screen at the game's size, round (cx, cy)."""
    x0 = max(0, min(1014 - wd, cx - wd // 2))
    y0 = max(0, min(468 - ht, cy - ht // 2))
    return frame(d, move, k).crop((x0, y0, x0 + wd, y0 + ht))


def near(d, move, k, cx, cy):
    """Twice the size round (cx, cy)."""
    x0 = max(0, min(1014 - 270, cx - 135))
    y0 = max(0, min(468 - 140, cy - 70))
    return frame(d, move, k).crop((x0, y0, x0 + 270, y0 + 140)).resize((540, 280), Image.NEAREST)


def pairs(d, title, note, items, size=tile):
    out = []
    for i in range(0, len(items), 2):
        two = items[i:i + 2]
        # (a tile may ask to be taller: [move, frame, x, y, label, height])
        tiles = [size(d, it[0], it[1], it[2], it[3], ht=it[5]) if len(it) > 5 else size(d, it[0], it[1], it[2], it[3]) for it in two]
        out.append(block(title if i == 0 else '', note if i == 0 else '', row(tiles, ['%d: %s' % (it[1], it[4]) for it in two])))
    return out


def fan(d):
    """The fan: one landing per turn of the line, the middle one alone (frames of `fan`), each a small part at the game's size."""
    # (each round where it lies: toward the end its turn points to)
    import math
    def at(k):
        cx = int(507 + math.sin(math.radians(-60 + 15 * k)) * 150)
        return (cx - 190, 290, cx + 190, 468)
    ts = [frame(d, 'fan', k).crop(at(k)) for k in range(9)]
    labels = ['%+d deg' % a for a in (-60, -45, -30, -15, 0, 15, 30, 45, 60)]
    out = []
    for i in range(0, 9, 3):
        out.append(block('THE LINE AT EVERY TURN (EVERY 15 DEGREES), AT THE GAME\'S SIZE' if i == 0 else '', 'The middle one of phase 2 landed along each turn of its line, from its root toward the hero; each drawn for its turn (9 turns cover the stone).' if i == 0 else '', row(ts[i:i + 3], labels[i:i + 3])))
    return out


def sheet(d, out, items):
    """The sheet: its head; the game-size blocks; the fan of turns; the twice-size blocks."""
    parts = []
    intro = 'Key frames from the film, as the player sees them: the phone\'s screen at the game\'s own size (two picture pixels to a game pixel), the stone, the Warrior, the camera lowered to see the stone; then closer, at twice. Each tentacle a figure of its own: its stand never still; a slam on the stone (a held wind-up with the game\'s warning under it, two smeared frames of strike landing along the line, a beat lying there, dragged back up); the water slams with their waves and the crash; struck; its death.'
    hl = wrap(intro, small, W - 48)
    hd = Image.new('RGB', (W, 76 + 26 * len(hl) + 10), BG)
    dr = ImageDraw.Draw(hd)
    dr.text((24, 22), 'THE SWAMP COLOSSUS: HIS TENTACLES', font=big, fill=PALE)
    for i, l in enumerate(hl): dr.text((24, 66 + 26 * i), l, font=small, fill=GREY)
    parts.append(hd)
    for title, note, its, twice in items:
        if not twice: parts.extend(pairs(d, title, note, its, tile))
    parts.extend(fan(d))
    for title, note, its, twice in items:
        if twice: parts.extend(pairs(d, title, note, its, near))
    H = sum(p.height for p in parts)
    s = Image.new('RGB', (W, H), BG)
    y = 0
    for p in parts: s.paste(p, (0, y)); y += p.height
    assert s.height <= 7000, s.height
    s.save(out, optimize=True)
    print(out, s.size)


if __name__ == '__main__':
    mode, d, out = sys.argv[1], sys.argv[2], sys.argv[3]
    if mode == 'film':
        film(d, out)
    else:
        import json
        # (the sheet's blocks: [title, note, [[move, frame, x, y, label], ...], twice])
        sheet(d, out, [(t, n, [tuple(x) for x in its], tw) for t, n, its, tw in json.load(open(sys.argv[4]))])
