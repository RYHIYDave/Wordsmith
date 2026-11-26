#!/usr/bin/env python3
"""Hannar Manor Games splash, before the Wordsmith title screen: fade up from black, the chimney's smoke
squiggling, the door swinging open onto black, a flight through the doorway into black, then the title screen
fades up. Two looks: night and white (the cream icon). 1280x720, 30 fps.

   python3 make_splash.py <title_still.png> <out_dir> [--frames t1,t2,...]   (stills to look at, no film)
"""
import io, math, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

W, H, FPS = 1280, 720, 30
LOOKS = {
    'night': dict(bg='#2b2440', ink='#fff4e6', h='#ff7a45', m='#3fd0c0', win='#ffd166', door='#ff7a45', text='#fff4e6', sub='#cfc6e0', hole='#000000'),
    # (the White look, his pick: the doorway inside the colour of its frame and every line, at his word, 26 Nov 2026, 17:24)
    'white': dict(bg='#fff4e6', ink='#2b2440', h='#ff7a45', m='#2a9d8f', win='#ffd166', door='#ff7a45', text='#2b2440', sub='#5e5670', hole='#2b2440'),
}
# the timeline, in seconds
T_FADE = (0.3, 1.8)      # up from black
T_DOOR = (3.4, 4.3)      # the door swings open
T_TEXT = (4.2, 4.6)      # the name fades away
T_ZOOM = (4.5, 5.9)      # the flight through the doorway
T_DARK = (5.9, 6.4)      # the doorway's colour, filling the screen, going to black
T_GAME_END = 6.6         # the game's film ends here, on black: the start screen comes up from black in the game
T_TITLE = (6.5, 7.8)     # the title screen fades up
T_END = 9.3

K0 = 1.45                          # the house's size on screen (house units to pixels)
HOUSE_X0 = (W - 360 * K0) / 2 - 20 * K0   # house units 20..380 across, centred
HOUSE_Y0 = 34                      # house unit 0 at this pixel row
DOOR = (219.0, 264.0)              # the doorway's middle, in house units
ZOOM_MAX = 70.0


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def span(t, ab):
    return clamp((t - ab[0]) / (ab[1] - ab[0]))


def smooth(u):
    return u * u * (3 - 2 * u)


def smoke_path(t):
    """The smoke: one line rising off the chimney, its wave climbing, wider and leaning as it rises."""
    pts = []
    n = 44
    for i in range(n + 1):
        v = i / n
        y = 58 - 64 * v
        amp = 1.5 + 8.5 * v
        x = 283 + amp * math.sin(2 * math.pi * (1.5 * v - 0.85 * t)) + 6 * v * v
        pts.append((x, y))
    return 'M' + ' L'.join(f'{x:.2f},{y:.2f}' for x, y in pts)


def door_shape(u):
    """The door swung in by u (0 shut, 1 open): hinged on its left, its free edge going away and shorter."""
    ang = math.radians(82 * u)
    s = math.cos(ang)
    shrink = 0.10 * math.sin(ang)          # the far edge looks shorter as it swings away
    yc = 261.0

    def P(x, y):
        f = (x - 200) / 38.0
        return (200 + (x - 200) * s, yc + (y - yc) * (1 - shrink * f))
    outline = [P(200, 300), P(200, 238)]
    for i in range(1, 9):                   # the arched top, as the door's path draws it
        a = math.pi - math.pi * i / 8
        outline.append(P(219 + 19 * math.cos(a), 238 - 16 * math.sin(a)))
    outline += [P(238, 300)]
    d = 'M' + ' L'.join(f'{x:.2f},{y:.2f}' for x, y in outline) + ' Z'
    knob = P(229, 264)
    return d, knob, s


def house_svg(c, t, door_u):
    door_d, knob, s = door_shape(door_u)
    door_parts = ''
    if door_u > 0:
        door_parts += f'<path d="M200,300 L200,238 Q200,222 219,222 Q238,222 238,238 L238,300 Z" fill="{c["hole"]}"/>'
    door_parts += (f'<path d="{door_d}" fill="{c["door"]}" stroke="{c["ink"]}" stroke-width="{6 + 2 * s:.2f}" stroke-linejoin="round"/>'
                   f'<circle cx="{knob[0]:.2f}" cy="{knob[1]:.2f}" r="{4 * max(s, 0.35):.2f}" fill="{c["ink"]}"/>')
    if door_u > 0:   # the door frame drawn again over the swung panel's edge
        door_parts += f'<path d="M200,300 L200,238 Q200,222 219,222 Q238,222 238,238 L238,300" fill="none" stroke="{c["ink"]}" stroke-width="8" stroke-linejoin="round"/>'
    return f'''
<defs><linearGradient id="smk" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="-8">
<stop offset="0" stop-color="{c['ink']}" stop-opacity="1"/><stop offset="0.7" stop-color="{c['ink']}" stop-opacity="0.85"/><stop offset="1" stop-color="{c['ink']}" stop-opacity="0"/></linearGradient></defs>
<path d="{smoke_path(t)}" fill="none" stroke="url(#smk)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<polygon points="268,66 298,66 298,128 268,106" fill="{c['bg']}" stroke="{c['ink']}" stroke-width="9" stroke-linejoin="round"/>
<path d="M72,158 L72,318 M150,99 L150,318 M72,238 L150,238" fill="none" stroke="{c['h']}" stroke-width="13" stroke-linecap="round"/>
<path d="M176,318 L176,82 L219,174 L262,110 L262,318" fill="none" stroke="{c['m']}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M328,158 L328,318" fill="none" stroke="{c['ink']}" stroke-width="10" stroke-linecap="round"/>
<path d="M90,214 L90,188 Q90,168 111,168 Q132,168 132,188 L132,214 Z" fill="{c['win']}" stroke="{c['ink']}" stroke-width="8" stroke-linejoin="round"/>
<path d="M111,170 L111,214 M90,194 L132,194" fill="none" stroke="{c['ink']}" stroke-width="5"/>
<path d="M278,216 L278,194 Q278,176 296,176 Q314,176 314,194 L314,216 Z" fill="{c['win']}" stroke="{c['ink']}" stroke-width="8" stroke-linejoin="round"/>
<path d="M296,178 L296,216 M278,199 L314,199" fill="none" stroke="{c['ink']}" stroke-width="5"/>
<path d="M90,318 L90,270 Q90,256 104,256 L120,256 Q134,256 134,270 L134,318" fill="none" stroke="{c['ink']}" stroke-width="8" stroke-linejoin="round"/>
{door_parts}
<rect x="190" y="298" width="58" height="10" rx="5" fill="{c['bg']}" stroke="{c['ink']}" stroke-width="6"/>
<path d="M36,178 L200,56 L364,178" fill="none" stroke="{c['ink']}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30,320 L370,320" fill="none" stroke="{c['ink']}" stroke-width="12" stroke-linecap="round"/>'''


def frame_svg(look, t):
    c = LOOKS[look]
    door_u = smooth(span(t, T_DOOR))
    z = span(t, T_ZOOM)
    e = z ** 3                                    # it speeds up as it goes in
    S = math.exp(math.log(ZOOM_MAX) * e)
    k = K0 * S
    # the doorway's place on screen: where it stands, drawn to the middle as the flight goes in
    dx0, dy0 = HOUSE_X0 + DOOR[0] * K0, HOUSE_Y0 + DOOR[1] * K0
    cx, cy = dx0 + (W / 2 - dx0) * smooth(z), dy0 + (H / 2 - dy0) * smooth(z)
    tx, ty = cx - DOOR[0] * k, cy - DOOR[1] * k
    text_a = 1 - smooth(span(t, T_TEXT))
    fade = smooth(span(t, T_FADE))
    text = ''
    if text_a > 0:
        text = (f'<g opacity="{text_a:.3f}" font-family="Poppins" text-anchor="middle">'
                f'<text x="{W/2}" y="{HOUSE_Y0 + 330*K0 + 92}" font-size="64" font-weight="700" fill="{c["text"]}">'
                f'<tspan fill="{c["h"]}">H</tspan>annar <tspan fill="{c["m"]}">M</tspan>anor</text>'
                f'<text x="{W/2 + 7}" y="{HOUSE_Y0 + 330*K0 + 138}" font-size="24" font-weight="500" letter-spacing="14" fill="{c["sub"]}">GAMES</text></g>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{c["bg"]}"/>'
            f'<g transform="translate({tx:.3f},{ty:.3f}) scale({k:.5f})">{house_svg(c, t, door_u)}</g>'
            f'{text}'
            f'<rect width="{W}" height="{H}" fill="#000000" opacity="{1 - fade:.4f}"/></svg>')


OUT = [W, H]   # the size it is drawn at (the game's: 960x540)


def render_logo(look, t):
    svg = frame_svg(look, t).encode()
    out = subprocess.run(['rsvg-convert', '-w', str(OUT[0]), '-h', str(OUT[1])], input=svg, capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(out)).convert('RGB')


def title_frame(title, t):
    a = smooth(span(t, T_TITLE))
    return Image.blend(Image.new('RGB', tuple(OUT), (0, 0, 0)), title, a)


def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def frame(look, title, i):
    t = i / FPS
    if t >= T_ZOOM[1]:
        if t >= T_TITLE[0] and title is not None:
            return title_frame(title, t)
        # (the doorway's colour fills the screen as the flight ends, then goes to black)
        a = smooth(span(t, T_DARK))
        hole = hex_rgb(LOOKS[look]['hole'])
        return Image.new('RGB', tuple(OUT), tuple(round(v * (1 - a)) for v in hole))
    return render_logo(look, t)


def main():
    title_png, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    if '--game' in sys.argv:
        # THE GAME'S FILM: the White look at the game's size, 960x540, ending on black, as Theora (.ogv, which Godot plays)
        OUT[0], OUT[1] = 960, 540
        tmp = os.path.join(out_dir, 'hannar_manor_splash.tmp.ogv')
        dst = os.path.join(out_dir, 'hannar_manor_splash.ogv')
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '960x540', '-framerate', str(FPS),
                               '-i', '-', '-c:v', 'libtheora', '-q:v', '9', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
        with ThreadPoolExecutor(max_workers=6) as pool:
            for im in pool.map(lambda i: frame('white', None, i), range(round(T_GAME_END * FPS))):
                ff.stdin.write(im.tobytes())
        ff.stdin.close()
        if ff.wait() == 0:
            os.replace(tmp, dst)
            print(dst)
        return
    title = Image.open(title_png).convert('RGB').resize((W, H), Image.NEAREST)
    if '--frames' in sys.argv:
        ts = [float(x) for x in sys.argv[sys.argv.index('--frames') + 1].split(',')]
        for look in LOOKS:
            for t in ts:
                frame(look, title, round(t * FPS)).save(os.path.join(out_dir, f'still_{look}_{t:.2f}.jpg'), quality=92)
        return
    n = round(T_END * FPS)
    looks = [sys.argv[sys.argv.index('--look') + 1]] if '--look' in sys.argv else list(LOOKS)
    for look in looks:
        tmp = os.path.join(out_dir, f'hannar-manor-splash-{look}.tmp.mp4')
        dst = os.path.join(out_dir, f'hannar-manor-splash-{look}.mp4')
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-framerate', str(FPS),
                               '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tmp],
                              stdin=subprocess.PIPE)
        with ThreadPoolExecutor(max_workers=6) as pool:
            for im in pool.map(lambda i: frame(look, title, i), range(n)):
                ff.stdin.write(im.tobytes())
        ff.stdin.close()
        if ff.wait() == 0:
            os.replace(tmp, dst)
            print(dst)


if __name__ == '__main__':
    main()
