#!/usr/bin/env python3
"""THE SWAMP COLOSSUS'S MOVES, PART 1, FOR THE OWNER'S PHONE (art/eye_moves.ts; a mock-up, not in the game): from the frames
tools/eye_moves_pics.ts lays together (the phone's screen, 1014 x 468 picture pixels, two to a game pixel):
   python3 tools/eye_moves_sheet.py sheet <frames dir> <out.png>    key frames of each move, at the game's size and at twice
   python3 tools/eye_moves_sheet.py film <frames dir> <out.mp4>     his lurk looped twice; his entrance at full speed, then at half;
                                                                    his stand looped three times; his entrance again, close up
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W = 1200
BG, PALE, GREY, PINK = (20, 19, 26), (236, 232, 240), (176, 172, 188), (255, 150, 190)
big, mid, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 22), ImageFont.truetype(R, 20)
probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
FPS = 30
# (art/eye_moves.ts EYE_ENTRANCE and EYE_SCREEN: the beats, frames from the first of his entrance)
STIR, RISE, BREAKS, STRAIN, TEAR, SETTLE, STALK, LIDS, BREATHE, ARMS, END = 0, 30, 38, 108, 129, 133, 156, 186, 192, 222, 270
BURSTS = {'left': 232, 'right': 237, 'middle': 242}

def wrap(text, font, width):
    words, lines, line = text.split(), [], ''
    for w in words:
        t = (line + ' ' + w).strip()
        if probe.textlength(t, font=font) > width and line:
            lines.append(line); line = w
        else:
            line = t
    if line: lines.append(line)
    return lines

def frame(d, move, k):
    return Image.open(os.path.join(d, '%s_%03d.png' % (move, k))).convert('RGB')

def beat(k):
    """What is happening at a frame of his entrance (his beats, in his words' order)."""
    if k < RISE: return '1. THE RISE: the eye\'s fire sinks into him, his jaws shut under the water; the water stirs, then boils'
    if k < STRAIN: return '1. HE RISES SHUT, a melting mound: the screen rumbling, water pouring off him'
    if k < TEAR: return '2. THE STRAIN: his seam splitting, strings of flesh and spittle across it, his throat\'s glow through it'
    if k < SETTLE: return '2. THE ROAR: his jaws tear apart (four frames), more screen shake, spray and goo blasted out'
    if k < STALK: return '2. THE ROAR: the water slammed flat in a ring, the spray falling, his jaws settling'
    if k < LIDS: return '3. THE EYE STALK: his tongue unfurls out of his throat, its eye shut'
    if k < BREATHE: return '3. THE EYE STALK: its eye snaps open to stare'
    if k < ARMS: return '4. THE MOMENT BREATHES: nothing new; he looms, melting, staring'
    if k < END - 8: return '5. THE TENTACLES COME UP: the water bulging, then each bursting up (left, right, middle)'
    return '6. PHASE 2: into his stand'

def caption_bar(width, title, line, foot):
    bar = Image.new('RGB', (width, 72), BG)
    d = ImageDraw.Draw(bar)
    d.text((14, 6), title, font=mid, fill=PALE)
    d.text((14, 38), line, font=small, fill=PINK if line.startswith(('1.', '2.', '3.', '4.', '5.', '6.')) else GREY)
    tw = probe.textlength(foot, font=small)
    d.text((width - 14 - tw, 10), foot, font=small, fill=GREY)
    return bar

CROP = (254, 8, 761, 242)  # him, close: 507 x 234 picture pixels, twice the size fills the screen

def film(d, out):
    seq = []
    for rep in range(2):
        for k in range(90): seq.append(('lurk', k, 'HIS LURK (PHASE 1), LOOPED TWICE', 'deep under the black water: his eye\'s fire drifting and pulsing, bubbles, the swell, goo rising', '%d of 2  |  %.2f s' % (rep + 1, k / FPS), False))
    for k in range(END): seq.append(('entrance', k, 'HIS ENTRANCE, FULL SPEED (%.1f s)' % (END / FPS), beat(k), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    for k in range(END):
        for _ in range(2): seq.append(('entrance', k, 'HIS ENTRANCE, HALF SPEED', beat(k), 'frame %d  |  %.2f s' % (k, k / FPS), False))
    for rep in range(3):
        for k in range(90): seq.append(('stand', k, 'HIS STAND, LOOPED THREE TIMES (%.0f s a loop)' % (90 / FPS), 'melting, dripping, spittle snapping, jaws breathing, the tongue-eye weaving, watching you', '%d of 3  |  %.2f s' % (rep + 1, k / FPS), False))
    for k in range(END): seq.append(('entrance', k, 'HIS ENTRANCE AGAIN, CLOSE UP (TWICE THE SIZE)', beat(k), 'frame %d  |  %.2f s' % (k, k / FPS), True))
    w, h = 1014, 468 + 72
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (w, h), '-framerate', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    cache = {}
    for (move, k, title, line, foot, close) in seq:
        key = (move, k, close)
        if key not in cache:
            if len(cache) > 400: cache.clear()
            im = frame(d, move, k)
            if close: im = im.crop(CROP).resize((1014, 468), Image.NEAREST)
            cache[key] = im
        im = cache[key]
        f = Image.new('RGB', (w, h), BG)
        f.paste(im, (0, 0))
        f.paste(caption_bar(w, title, line, foot), (0, 468))
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    print(out, len(seq), 'frames', '%.1f s' % (len(seq) / FPS))

def block(title, note, img):
    tl = wrap(title, mid, W - 48)
    nl = wrap(note, small, W - 48) if note else []
    h = 16 + 30 * len(tl) + 26 * len(nl) + 10 + (img.height if img else 0) + 12
    b = Image.new('RGB', (W, h), BG)
    dr = ImageDraw.Draw(b)
    y = 16
    for l in tl: dr.text((24, y), l, font=mid, fill=PALE); y += 30
    for l in nl: dr.text((24, y), l, font=small, fill=GREY); y += 26
    if img: b.paste(img, ((W - img.width) // 2, y + 10))
    return b

def row(tiles, labels):
    """Tiles side by side, each with its label under it."""
    gap = 12
    tw = sum(t.width for t in tiles) + gap * (len(tiles) - 1)
    th = max(t.height for t in tiles) + 30
    r = Image.new('RGB', (tw, th), BG)
    dr = ImageDraw.Draw(r)
    x = 0
    for t, l in zip(tiles, labels):
        r.paste(t, (x, 0))
        dr.text((x + 4, t.height + 4), l, font=small, fill=GREY)
        x += t.width + gap
    return r

def sheet(d, out):
    parts = []
    hl = wrap('Key frames from the film, as the player sees them: the phone\'s screen at the game\'s own size (two picture pixels to a game pixel), the stone, the Warrior at his spot, the camera leaned toward him; then closer, at twice. His entrance as he set it: rises shut with the screen rumbling and water pouring off; a big roar, more shake; the eye stalk comes out; the moment breathes; the tentacles come up; phase 2.', small, W - 48)
    hd = Image.new('RGB', (W, 76 + 26 * len(hl) + 10), BG)
    dr = ImageDraw.Draw(hd)
    dr.text((24, 22), 'THE SWAMP COLOSSUS: HIS STAND, HIS LURK, HIS ENTRANCE', font=big, fill=PALE)
    for i, l in enumerate(wrap('Key frames from the film, as the player sees them: the phone\'s screen at the game\'s own size (two picture pixels to a game pixel), the stone, the Warrior at his spot, the camera leaned toward him; then closer, at twice. His entrance as he set it: rises shut with the screen rumbling and water pouring off; a big roar, more shake; the eye stalk comes out; the moment breathes; the tentacles come up; phase 2.', small, W - 48)):
        dr.text((24, 66 + 26 * i), l, font=small, fill=GREY)
    parts.append(hd)
    # (his lurk: the whole screen at the game's size)
    parts.append(block('HIS LURK (PHASE 1), THE WHOLE SCREEN AT THE GAME\'S SIZE', 'The dark shape of him deep under the black water, heaving; his eye\'s fire drifting and pulsing up through it; bubbles breaking, the slow swell, slicks of his goo rising. (The two phase 1 tentacles are their own figures, drawn with their own moves later; at the end of phase 1 they are dead.)', frame(d, 'lurk', 30)))
    # (his entrance's beats at the game's size: him and the water round him, two to a row)
    G = (217, 0, 797, 316)
    beats = [(20, '1. the eye sinks, his jaws shut, the water stirs'), (52, '1. he breaks the water, shut, rumbling'), (84, '1. rising, water pouring off him'), (118, '2. the strain: his seam splitting'), (130, '2. THE ROAR: torn apart'), (138, '2. the ring slammed out, spray and goo'), (172, '3. the eye stalk unfurls, its eye shut'), (189, '3. its eye snaps open'), (205, '4. the moment breathes'), (231, '5. the water bulges over a tentacle'), (234, '5. the left one bursts up'), (262, '6. phase 2: his stand')]
    for i in range(0, len(beats), 2):
        two = beats[i:i + 2]
        parts.append(block('HIS ENTRANCE, AT THE GAME\'S SIZE' if i == 0 else '', 'Frames from its first (30 a second): %s.' % ', '.join('%d (%.2f s)' % (k, k / FPS) for k, _ in two) if i == 0 else '', row([frame(d, 'entrance', k).crop(G) for k, _ in two], ['%d: %s' % (k, l) for k, l in two])))
    # (closer: twice the size)
    # (each closer view centred on what is happening: x, y on the screen)
    def near(move, k, cx, cy):
        return frame(d, move, k).crop((cx - 145, cy - 75, cx + 145, cy + 75)).resize((580, 300), Image.NEAREST)
    close = [(84, 'rising shut, water pouring off', 507, 100), (124, 'the strain', 507, 96), (131, 'the roar', 507, 190), (172, 'the stalk, its eye shut', 507, 84), (189, 'its eye snaps open', 507, 90), (236, 'a tentacle bursts', 250, 260)]
    for i in range(0, len(close), 2):
        two = close[i:i + 2]
        parts.append(block('HIS ENTRANCE, TWICE THE SIZE' if i == 0 else '', '', row([near('entrance', k, cx, cy) for k, _, cx, cy in two], ['%d: %s' % (k, l) for k, l, _, _ in two])))
    # (his stand)
    parts.append(block('HIS STAND, AT THE GAME\'S SIZE', 'A loop of 3 s (90 frames) that ends where it begins: his flesh sliding and dripping, his spittle snapping and knitting, his jaws breathing, his throat pulsing, his tongue-eye weaving and watching you; his tentacles swaying at their roots.', row([frame(d, 'stand', k).crop(G) for k in (0, 45)], ['0', '45'])))
    parts.append(block('HIS STAND, TWICE THE SIZE', '', row([near('stand', 15, 507, 110), near('stand', 60, 507, 200)], ['15: his eye weaving, watching you', '60: his maw: teeth, spittle, drips, his throat'])))
    H = sum(p.height for p in parts)
    s = Image.new('RGB', (W, H), BG)
    y = 0
    for p in parts: s.paste(p, (0, y)); y += p.height
    assert s.height <= 7000, s.height
    s.save(out, optimize=True)
    print(out, s.size)

if __name__ == '__main__':
    mode, d, out = sys.argv[1], sys.argv[2], sys.argv[3]
    film(d, out) if mode == 'film' else sheet(d, out)
