#!/usr/bin/env python3
"""THE SWAMP COLOSSUS'S MOVES, PART 3: HIS SHOVEL, FOR THE OWNER'S PHONE (art/eye_shovel.ts; a mock-up, not in the game): from the
frames tools/eye_moves_pics.ts lays together (the phone's screen, 1014 x 468 picture pixels, two to a game pixel):
   python3 tools/eye_shovel_sheet.py sheet <frames dir> <out.png> <layout.json>   key frames at the game's size and at twice
   python3 tools/eye_shovel_sheet.py film <frames dir> <out.mp4>                   the shovel at the left end, full speed (the Warrior
                                                                                   weaving, hit and knocked toward the mouth, just
                                                                                   escaping the snap); at the right end; the snap close
                                                                                   up at half speed
(the beats' frames as art/eye_shovel.ts SHOVEL, SCRAPERS, SCRAPE and SNAP set them)
"""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
from eye_moves_sheet import BG, PALE, GREY, PINK, W, big, mid, small, wrap, block, row, caption_bar

FPS = 30
# (art/eye_shovel.ts SHOVEL: each beat's frames, from his stand)
SINK, TELL, BURST, ROAR, SHOVEL, BACK, RISE, FRAMES = (0, 22), (22, 56), (56, 60), (60, 84), (84, 300), (300, 314), (318, 348), 352
# (SCRAPERS: each tentacle's edge and first frame; SCRAPE: up 8, its sweep 45, held 3, drawn back 6, slid back 16, under 8)
SCRAPERS = [('back', 84), ('near', 128), ('back', 190), ('near', 234)]
UP, SWEEP, HELD, RETRACT, SLIDE, UNDER = 8, 45, 3, 6, 16, 8
# (SNAP, the left end's: its twitch held 6 frames, the strike 2 (smeared), held shut 8, back and gaping 15)
SNAP_AT, TWITCH, STRIKE, SHUT, OPEN = 196, 6, 2, 8, 15
HIT = 159  # the Warrior struck and knocked toward the mouth (the left end)


def frame(d, move, k):
    return Image.open(os.path.join(d, '%s_%03d.png' % (move, k))).convert('RGB')


def beat(k, snap):
    """What is happening at a frame of a shovel (the most important thing)."""
    bs = []
    if SINK[0] <= k < SINK[1]: bs.append((3, 'HE SINKS out of his stand, his tentacles with him; the screen rumbling'))
    if TELL[0] <= k < TELL[1]: bs.append((4, 'THE TELL, HELD 1.1 s (the wind-up): the water boiling off the stone\'s end, the end shuddering'))
    if BURST[0] <= k < BURST[1]: bs.append((6, 'HE BURSTS UP at the end (the strike, smeared): his maw on its side, jaws along both edges'))
    if BURST[1] <= k < ROAR[1]: bs.append((5, 'THE ROAR (the wind-down): water pouring off him, his maw gaping across the whole stone'))
    for i, (edge, k0) in enumerate(SCRAPERS):
        f = k - k0
        nm = 'TENTACLE %d (%s edge, tip %s)' % (i + 1, edge, 'hooked down' if edge == 'back' else 'curled up')
        gap = 'its gap at the %s edge' % ('near' if edge == 'back' else 'back')
        if 0 <= f < UP: bs.append((2, '%s rises out of the water past the far end' % nm))
        elif UP <= f < UP + SWEEP: bs.append((3, '%s SCRAPES toward his mouth; %s' % (nm, gap)))
        elif UP + SWEEP <= f < UP + SWEEP + HELD + RETRACT: bs.append((2, '%s runs into his maw, drawn back off the stone' % nm))
        elif UP + SWEEP + HELD + RETRACT <= f < UP + SWEEP + HELD + RETRACT + SLIDE + UNDER: bs.append((1, '%s slid back and under' % nm))
    if snap:
        f = k - SNAP_AT
        if HIT <= k < HIT + 12: bs.append((7, 'HIT: the Warrior caught by the tentacle and knocked toward the mouth'))
        elif HIT + 12 <= k < SNAP_AT - 3: bs.append((5, 'the Warrior down near the mouth'))
        elif SNAP_AT - 3 <= k < SNAP_AT: bs.append((5, 'the Warrior up, leaping away from the mouth'))
        if 0 <= f < TWITCH: bs.append((8, 'THE SNAP, ITS TWITCH, HELD (the wind-up): the Warrior too close; jaws flexing wider'))
        elif TWITCH <= f < TWITCH + STRIKE: bs.append((9, 'THE SNAP (the strike, 2 smeared frames): slamming shut; the Warrior leaping clear'))
        elif TWITCH + STRIKE <= f < TWITCH + STRIKE + SHUT: bs.append((8, 'HELD CLENCHED: his teeth clashed, spittle and spray bursting, splinters flying'))
        elif TWITCH + STRIKE + SHUT <= f < TWITCH + STRIKE + SHUT + OPEN: bs.append((7, 'the wind-down: back, gaping again'))
    if BACK[0] <= k < BACK[1]: bs.append((4, 'HE GOES BACK: sinking at the end'))
    if BACK[1] <= k < RISE[0]: bs.append((4, 'under: going back to his place'))
    if RISE[0] <= k < RISE[1]: bs.append((4, 'up at his place, a short rise'))
    if k >= RISE[1]: bs.append((1, 'his stand'))
    if not bs: bs.append((0, 'his maw gaping, his tongue-eye weaving, never still'))
    return max(bs)[1]


def crop_snap(k):
    """The snap close up, at 1.8 times the size (563 x 260 picture pixels filling the screen): on his maw as it twitches and the Warrior
    getting up before it; panning with the strike onto its front, his teeth clashed, and the Warrior just clear."""
    t = max(0.0, min(1.0, (k - (SNAP_AT + TWITCH - 3)) / 5.0))
    t = t * t * (3 - 2 * t)
    x0 = round(80 + (270 - 80) * t)
    # (then down with the Warrior as he runs on toward the near edge; and back over his maw as it gapes again)
    u = max(0.0, min(1.0, (k - (SNAP_AT + TWITCH + 3)) / 8.0))
    w = max(0.0, min(1.0, (k - (SNAP_AT + TWITCH + STRIKE + SHUT)) / 10.0))
    y0 = round(30 + (8 - 30) * t + 34 * u * u * (3 - 2 * u))
    x0 = round(x0 - 130 * w * w * (3 - 2 * w))
    return (x0, y0, x0 + 563, y0 + 260)


def film(d, out):
    seq = []
    for k in range(FRAMES): seq.append(('s1', k, 'HIS SHOVEL AT THE LEFT END, FULL SPEED', beat(k, True), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    for k in range(FRAMES): seq.append(('s2', k, 'HIS SHOVEL AT THE RIGHT END, FULL SPEED', beat(k, False), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    for k in range(SNAP_AT - 8, SNAP_AT + TWITCH + STRIKE + SHUT + OPEN + 4):
        for _ in range(2): seq.append(('s1', k, 'THE SNAP, CLOSE UP, HALF SPEED', beat(k, True), 'frame %d  |  %.2f s' % (k, k / FPS), True))
    w, h = 1014, 468 + 72
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (w, h), '-framerate', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    cache = {}
    for (move, k, title, line, foot, close) in seq:
        key = (move, k, close)
        if key not in cache:
            if len(cache) > 300: cache.clear()
            im = frame(d, move, k)
            if close: im = im.crop(crop_snap(k)).resize((1014, 468), Image.NEAREST)
            cache[key] = im
        f = Image.new('RGB', (w, h), BG)
        f.paste(cache[key], (0, 0))
        f.paste(caption_bar(w, title, line, foot), (0, 468))
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    print(out, len(seq), 'frames', '%.1f s' % (len(seq) / FPS))


def tile(d, move, k, cx, cy, wd=500, ht=300):
    """A part of the screen at the game's size, round (cx, cy)."""
    x0 = max(0, min(1014 - wd, cx - wd // 2))
    y0 = max(0, min(468 - ht, cy - ht // 2))
    return frame(d, move, k).crop((x0, y0, x0 + wd, y0 + ht))


def near(d, move, k, cx, cy, ht=140):
    """Twice the size round (cx, cy)."""
    x0 = max(0, min(1014 - 270, cx - 135))
    y0 = max(0, min(468 - ht, cy - ht // 2))
    return frame(d, move, k).crop((x0, y0, x0 + 270, y0 + ht)).resize((540, ht * 2), Image.NEAREST)


def pairs(d, title, note, items, size=tile):
    out = []
    for i in range(0, len(items), 2):
        two = items[i:i + 2]
        tiles = [size(d, it[0], it[1], it[2], it[3], ht=it[5]) if len(it) > 5 else size(d, it[0], it[1], it[2], it[3]) for it in two]
        out.append(block(title if i == 0 else '', note if i == 0 else '', row(tiles, ['%s %d: %s' % ('left' if it[0] == 's1' else 'right', it[1], it[4]) for it in two])))
    return out


def sheet(d, out, items, intro):
    parts = []
    hl = wrap(intro, small, W - 48)
    hd = Image.new('RGB', (W, 76 + 26 * len(hl) + 10), BG)
    dr = ImageDraw.Draw(hd)
    dr.text((24, 22), 'THE SWAMP COLOSSUS: HIS SHOVEL', font=big, fill=PALE)
    for i, l in enumerate(hl): dr.text((24, 66 + 26 * i), l, font=small, fill=GREY)
    parts.append(hd)
    for title, note, its, twice in items: parts.extend(pairs(d, title, note, its, near if twice else tile))
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
        L = json.load(open(sys.argv[4]))
        # (the sheet's head, and its blocks: [title, note, [[move, frame, x, y, label(, height)], ...], twice])
        sheet(d, out, [(t, n, [tuple(x) for x in its], tw) for t, n, its, tw in L['blocks']], L['intro'])
