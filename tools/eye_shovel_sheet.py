#!/usr/bin/env python3
"""THE SWAMP COLOSSUS'S MOVES, PART 3: HIS SHOVEL, FOR THE OWNER'S PHONE (art/eye_shovel.ts; a mock-up, not in the game): from the
frames tools/eye_moves_pics.ts lays together (the phone's screen, 1014 x 468 picture pixels, two to a game pixel):
   python3 tools/eye_shovel_sheet.py sheet <frames dir> <out.png> <layout.json>   key frames at the game's size and at twice
   python3 tools/eye_shovel_sheet.py mirror <mirror dir> <out.png>                 the mirror test: at the right end, as painted and the
                                                                                   left end mirrored (tools/eye_moves_pics.ts mirror)
   python3 tools/eye_shovel_sheet.py film <frames dir> <out.mp4>                   the shovel at the left end, full speed (the Warrior
                                                                                   weaving, hit and knocked toward the mouth, just
                                                                                   escaping the snap); at the right end; the snap close
                                                                                   up at half speed
   python3 tools/eye_shovel_sheet.py film4 <frames dir> <close dir> <out.mp4>     PART 3B: his first shovel at the left end, full
                                                                                   speed, the pieces on the stone smashed in turn; the
                                                                                   smashes close up, half speed; the next shovel at the
                                                                                   right end, mirrored, over the rubble
   python3 tools/eye_shovel_sheet.py sheet4 <frames dir> <close dir> <out.png>    its key frames at the game's size and at twice
(the beats' frames as art/eye_shovel.ts SHOVEL, SCRAPERS, SCRAPE and SNAP set them; the close-ups from tools/eye_moves_pics.ts close,
each piece's in its own folder of <close dir>)
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


# THE MIRROR TEST (the owner, 8 Nov: whether one side of him mirrored would do for the other): each beat at the right end, AS PAINTED
# and MIRRORED (the left end's layers of him and his tentacles flipped about his own middle, over the right end's own stone, water,
# Warrior and effects); at the game's size, then closer at twice. [frame, title, note, (x, y) at the game's size, (x, y) at twice]
MIRROR = [
    ('059', 'THE BURST (frame 59)', 'Up through the water at the right end, the screen jolted, water pouring off him.', (700, 150), [(720, 110)]),
    ('074', 'THE ROAR, AT HIS WIDEST (frame 74)', 'His maw on its side gaping its widest, his tongue-eye in it, his throat hot.', (700, 150), [(720, 120)]),
    ('120', 'HIS GAPE, A TENTACLE SCRAPING (frame 120)', 'His gape with the first tentacle scraping along the back edge toward his maw (closer: his maw, and the tentacle).', (700, 150), [(730, 110), (170, 190)]),
]


def mirror(d, out):
    parts = []
    intro = ('The owner asked (8 Nov) whether one side of the Colossus could be drawn and mirrored for the other end. At the right end of '
             'the stone, each beat AS PAINTED (the right end\'s own paintings, him turned his own way round, lit from the left) beside '
             'MIRRORED (the left end\'s paintings of him and his tentacles flipped left to right about his own middle, standing where the '
             'painted one stands, over the right end\'s own stone, water and Warrior, which are not flipped). Nothing repainted. At the '
             'game\'s size, then closer at twice.')
    hl = wrap(intro, small, W - 48)
    hd = Image.new('RGB', (W, 76 + 26 * len(hl) + 10), BG)
    dr = ImageDraw.Draw(hd)
    dr.text((24, 22), 'THE SWAMP COLOSSUS: THE MIRROR TEST', font=big, fill=PALE)
    for i, l in enumerate(hl): dr.text((24, 66 + 26 * i), l, font=small, fill=GREY)
    parts.append(hd)
    def game(f, c):
        x0 = max(0, min(1014 - 500, c[0] - 250)); y0 = max(0, min(468 - 300, c[1] - 150))
        return Image.open(f).convert('RGB').crop((x0, y0, x0 + 500, y0 + 300))
    def twice(f, c):
        x0 = max(0, min(1014 - 270, c[0] - 135)); y0 = max(0, min(468 - 140, c[1] - 70))
        return Image.open(f).convert('RGB').crop((x0, y0, x0 + 270, y0 + 140)).resize((540, 280), Image.NEAREST)
    for k, title, note, cg, ct in MIRROR:
        a = os.path.join(d, 'mirror_%s_a.png' % k)
        b = os.path.join(d, 'mirror_%s_b.png' % k)
        parts.append(block(title, note, row([game(a, cg), game(b, cg)], ['AS PAINTED (the right end)', 'MIRRORED (the left end, flipped)'])))
        for c in ct: parts.append(block('', '', row([twice(a, c), twice(b, c)], ['AS PAINTED, at twice', 'MIRRORED, at twice'])))
    # (the snap: painted at the left end only; so mirrored only, as it would be at the right end)
    f = os.path.join(d, 'mirror_208s_b.png')
    parts.append(block('THE SNAP, HELD CLENCHED (frame 208)', 'Painted at the left end only (the right end in the film has no snap): so MIRRORED only, as it would look at the right end, his teeth clashed, spittle bursting (the Warrior here is the right end\'s own, away at the far side).', row([game(f, (640, 200)), twice(f, (520, 110))], ['MIRRORED (the left end, flipped)', 'MIRRORED, at twice'])))
    H = sum(p.height for p in parts)
    s = Image.new('RGB', (W, H), BG)
    y = 0
    for p in parts: s.paste(p, (0, y)); y += p.height
    assert s.height <= 7000, s.height
    s.save(out, optimize=True)
    print(out, s.size)


# PART 3B: THE PIECES ON THE STONE, SMASHED BY HIS FIRST SHOVEL (art/eye_pieces.ts; the owner, 8 Nov: “Smashed by the first sweep
# (Recommended)”). Each piece as art/eye_pieces.ts has it, the frame the first shovel's hook reaches it (tests/eye_pieces.test.ts prints
# them), where its close-up looks (tools/eye_moves_pics.ts close: a point of his space), what it is and how it breaks.
PIECES = [
    ('colR', 99, (275, 370, 30), 'THE FAR BACK COLUMN', 'its plinth bursts, its shaft topples and breaks across in three', 44),
    ('drums', 105, (235, 630, 10), 'THE DRUMS', 'one cracks in three and flies; the others roll on and crack in two', 34),
    ('mossB', 110, (140, 380, 10), 'THE MOSSY STONES BY THE BACK EDGE', 'each split in two, flung tumbling, the moss torn off', 34),
    ('mossN', 133, (-216, 590, 10), 'THE NEAR MOSSY STONES', 'each split in two, flung tumbling, the moss torn off', 34),
    ('colL', 137, (-270, 375, 30), 'THE COLUMN BY HIS END', 'its plinth bursts, its shaft topples across and breaks in three', 44),
]
BEFORE = 6


def smashed(k):
    """What of the pieces is happening at a frame of the first shovel (the left end), and how much it matters."""
    bs = []
    for tag, h, _, name, how, _n in PIECES:
        f = k - h
        if 0 <= f < 26:
            off = ' (off the screen: close up after)' if tag in ('colR', 'drums') else ''
            bs.append((6, 'SMASHED by tentacle 1: %s%s' % (name.lower(), off)))
    return bs


def beat4(k, shot):
    b = beat(k, shot == 's1')
    if shot == 's1':
        sm = smashed(k)
        if sm: return max(sm)[1]
        return b
    # (the next shovel: over the rubble)
    for i, (edge, k0) in enumerate(SCRAPERS):
        f = k - k0
        if UP <= f < UP + SWEEP: return 'TENTACLE %d (%s edge) SCRAPES toward his maw, riding over the rubble, grit flying' % (i + 1, edge)
    return b


def close_frame(c, tag, k):
    return Image.open(os.path.join(c, tag, 'close_s1_%03d.png' % k)).convert('RGB')


def film4(d, c, out):
    seq = []
    for k in range(FRAMES): seq.append((('s1', k), 'HIS FIRST SHOVEL AT THE LEFT END, FULL SPEED', beat4(k, 's1'), 'frame %d  |  %.2f s' % (k, k / FPS)))
    for tag, h, _, name, how, n in PIECES:
        for k in range(h - BEFORE, h + n + 1):
            line = '%s: tentacle 1 sweeping in' % name if k < h else '%s: %s' % (name, how) if k < h + n - 8 else '%s: left lying, the rubble for the rest of the fight' % name
            for _ in range(2): seq.append(((tag, k), 'THE SMASHES, CLOSE UP (twice the size), HALF SPEED', line, 'frame %d  |  %.2f s' % (k, k / FPS)))
    for k in range(FRAMES): seq.append((('s2', k), 'THE NEXT SHOVEL, RIGHT END: HIM MIRRORED', beat4(k, 's2'), 'frame %d  |  %.2f s' % (k, k / FPS)))
    w, h = 1014, 468 + 72
    # (every caption fits its bar)
    from eye_moves_sheet import probe
    for (_, title, line, foot) in seq:
        assert probe.textlength(title, font=mid) + probe.textlength(foot, font=small) + 50 < w, title
        assert probe.textlength(line, font=small) + 28 < w, line
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (w, h), '-framerate', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    last = None
    im = None
    for (key, title, line, foot) in seq:
        if key != last:
            im = frame(d, key[0], key[1]) if key[0] in ('s1', 's2') else close_frame(c, key[0], key[1])
            last = key
        f = Image.new('RGB', (w, h), BG)
        f.paste(im, (0, 0))
        f.paste(caption_bar(w, title, line, foot), (0, 468))
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    print(out, len(seq), 'frames', '%.1f s' % (len(seq) / FPS))


# THE SHEET: [title, note, [(source, frame, x, y, label), ...], at twice]; a source 's1' or 's2' is the film's frame (a tile of it at the
# game's size round x, y, or at twice); any other is a piece's close-up (already at twice: a tile of it round x, y)
SHEET4 = [
    ('AT THE START: THE PIECES ON THE STONE, WHOLE',
     'As the arena lays them, before he sinks (frame 12): the broken column at the back corner by the left end, the mossy stones toward the near edge; the mossy stones by the back edge, the broken column at the far back corner, the fallen drums by the near edge.',
     [('s1', 12, 300, 300, 'the left half of the stone'), ('s1', 12, 740, 300, 'the right half')], False),
    ('THE BROKEN COLUMN AT THE FAR BACK CORNER (frame 99)',
     'Tentacle 1, sweeping along the back edge, ploughs into it, jolted back; its plinth bursts, its shaft cracks across and topples toward you, a round shaft as it turns, lands (the screen jolted again) and breaks in three, the pieces sliding apart; dust and grit. Close, at twice the size.',
     [('colR', 99, 520, 200, '99: the hook reaches it'), ('colR', 102, 520, 200, '102: cracking, its plinth bursting'), ('colR', 108, 520, 220, '108: its shaft down, broken across'), ('colR', 130, 520, 220, '130: left lying, the rubble')], True),
    ('THE FALLEN DRUMS BY THE NEAR EDGE (frame 105)',
     'The drum the hook meets cracks in three and flies; the other two roll on toward you, rocking, and crack in two as they stop. Close, at twice the size.',
     [('drums', 104, 507, 234, '104: whole, the hook coming'), ('drums', 106, 507, 234, '106: smashed, the halves flying'), ('drums', 111, 507, 234, '111: rolling, cracking'), ('drums', 135, 507, 234, '135: the rubble')], True),
    ('THE MOSSY STONES, BY THE BACK EDGE (110) AND TOWARD THE NEAR EDGE (133)',
     'Each stone splits in two along a jagged line, the halves flung tumbling, moss torn off, bare stone under; grit and dust. Close, at twice the size.',
     [('mossN', 132, 507, 230, '132: whole, the hook reaching them'), ('mossN', 135, 507, 230, '135: split, flying'), ('mossN', 140, 507, 230, '140: settling'), ('mossN', 160, 507, 230, '160: the rubble')], True),
    ('THE COLUMN AT THE BACK CORNER BY HIS END (frame 137), AS THE PLAYER SEES IT',
     'At the game\'s size, the camera on the Warrior: the mossy stones toward the near edge smashed (133), then the column (137): its shaft toppling across onto the stone, landing, breaking in three; then left lying while the snap comes.',
     [('s1', 134, 520, 270, '134: the near mossy stones smashed'), ('s1', 140, 520, 270, '140: the column smashed, toppling'), ('s1', 146, 520, 270, '146: down, broken across'), ('s1', 200, 520, 270, '200: rubble, the snap coming')], False),
    ('', 'The column close, at twice the size.',
     [('colL', 138, 480, 180, '138: the hook ploughing in'), ('colL', 142, 480, 180, '142: toppling across'), ('colL', 146, 480, 200, '146: landed, breaking in three'), ('colL', 160, 480, 200, '160: lying, the dust settling')], True),
    ('THE NEXT SHOVEL AT THE RIGHT END: HIM MIRRORED, OVER THE RUBBLE',
     'At the right end he and his tentacles are now the left end\'s paintings flipped (“Mirror it but save the old one just in case.”); the stone, the water and the Warrior not flipped. The rubble lies where each piece stood; the hooks ride over it, scattering grit. At the game\'s size, then at twice.',
     [('s2', 74, 720, 234, '74: the roar, mirrored'), ('s2', 141, 480, 234, '141: a hook over the column\'s rubble'), ('s2', 182, 460, 280, '182: a hook over the drums\' rubble'), ('s2', 230, 600, 234, '230: his gape, mirrored')], False),
    ('', '', [('s2', 141, 520, 190, '141, at twice: over the column\'s rubble'), ('s2', 182, 470, 320, '182, at twice: over the drums\' rubble')], True),
]


def sheet4(d, c, out):
    parts = []
    intro = ('The owner, 8 Nov, asked what becomes of the pieces on the stone in the tentacles\' way: “Smashed by the first sweep '
             '(Recommended)”. The pieces are back on the stone at the start (the two broken columns at the back corners, the mossy '
             'stones by the back edge and toward the near edge, the fallen drums by the near edge); his first shovel\'s first tentacle '
             'smashes each as it reaches it, and the rubble lies there for the rest of the fight; the next shovel\'s tentacles ride '
             'over it, scattering grit. And at the right end he is now the left end\'s paintings mirrored (“Mirror it but save the '
             'old one just in case.”). Key frames as the player sees them, at the game\'s size; the smashes close, at twice.')
    hl = wrap(intro, small, W - 48)
    hd = Image.new('RGB', (W, 76 + 26 * len(hl) + 10), BG)
    dr = ImageDraw.Draw(hd)
    dr.text((24, 22), 'THE SWAMP COLOSSUS: THE PIECES SMASHED', font=big, fill=PALE)
    for i, l in enumerate(hl): dr.text((24, 66 + 26 * i), l, font=small, fill=GREY)
    parts.append(hd)
    def get(src, k, x, y, twice):
        if src in ('s1', 's2'):
            return near(d, src, k, x, y) if twice else tile(d, src, k, x, y)
        im = close_frame(c, src, k)
        wd, ht = (540, 280) if twice else (500, 300)
        x0 = max(0, min(1014 - wd, x - wd // 2)); y0 = max(0, min(468 - ht, y - ht // 2))
        return im.crop((x0, y0, x0 + wd, y0 + ht))
    for title, note, its, twice in SHEET4:
        for i in range(0, len(its), 2):
            two = its[i:i + 2]
            parts.append(block(title if i == 0 else '', note if i == 0 else '', row([get(*it[:4], twice) for it in two], [it[4] for it in two])))
    H = sum(p.height for p in parts)
    s = Image.new('RGB', (W, H), BG)
    y = 0
    for p in parts: s.paste(p, (0, y)); y += p.height
    assert s.height <= 7000, s.height
    s.save(out, optimize=True)
    print(out, s.size)


if __name__ == '__main__':
    mode, d, out = sys.argv[1], sys.argv[2], sys.argv[3]
    if mode == 'film4':
        film4(d, sys.argv[3], sys.argv[4])
    elif mode == 'sheet4':
        sheet4(d, sys.argv[3], sys.argv[4])
    elif mode == 'mirror':
        mirror(d, out)
    elif mode == 'film':
        film(d, out)
    else:
        import json
        L = json.load(open(sys.argv[4]))
        # (the sheet's head, and its blocks: [title, note, [[move, frame, x, y, label(, height)], ...], twice])
        sheet(d, out, [(t, n, [tuple(x) for x in its], tw) for t, n, its, tw in L['blocks']], L['intro'])
