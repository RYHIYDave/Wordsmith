"""Quick Hands vs Heavy Hands: the math, step by step, then the fight. Frames with PIL, joined by ffmpeg."""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frames')
os.makedirs(TMP, exist_ok=True)
for f in os.listdir(TMP):
    os.remove(os.path.join(TMP, f))

W, H, FPS = 1280, 720, 30
BG = (22, 21, 30)
INK = (236, 233, 244)
DIM = (160, 156, 178)
GRID = (58, 55, 72)
# (the four ways, the reference palette's dark steps, fixed order: Quick, as written, the chat's, his)
C_QUICK, C_WRITTEN, C_MINE, C_HIS = (0x33, 0x8c, 0xed), (0xe7, 0x66, 0x24), (0x00, 0xa8, 0x88), (0xd2, 0x8e, 0x05)
SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f_title = ImageFont.truetype(BOLD, 52)
f_head = ImageFont.truetype(BOLD, 40)
f_body = ImageFont.truetype(SANS, 32)
f_big = ImageFont.truetype(BOLD, 36)
f_small = ImageFont.truetype(SANS, 24)

frame_no = 0


def save(img):
    global frame_no
    img.save(os.path.join(TMP, f'{frame_no:05d}.png'))
    frame_no += 1


def mix(c, a):
    return tuple(int(BG[i] + (c[i] - BG[i]) * a) for i in range(3))


def lines_scene(head, color, lines, secs, step=0.9, sub=None):
    """A heading in the way's colour, then its lines one after another, each faded in over 0.4 s."""
    n = int(secs * FPS)
    for k in range(n):
        t = k / FPS
        img = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(img)
        d.rectangle([60, 70, 72, 118], fill=color)
        d.text((92, 66), head, font=f_head, fill=INK)
        if sub:
            d.text((92, 122), sub, font=f_small, fill=DIM)
        y = 190
        for i, (txt, kind) in enumerate(lines):
            a = max(0.0, min(1.0, (t - 0.5 - i * step) / 0.4))
            if a <= 0:
                break
            font = f_big if kind == 'big' else f_body
            col = mix(color if kind == 'big' else INK, a)
            d.text((92, y), txt, font=font, fill=col)
            y += 62 if kind == 'big' else 54
        save(img)


def bars_scene(head, sub, items, unit, secs, note=None):
    """Bars growing from zero, each its own way's colour, named and valued beside it in the text's ink."""
    n = int(secs * FPS)
    top = max(v for _, v, _, _ in items)
    x0, x1 = 400, 960
    for k in range(n):
        t = k / FPS
        grow = max(0.0, min(1.0, (t - 0.4) / 1.4))
        grow = 1 - (1 - grow) ** 3
        img = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(img)
        d.text((60, 56), head, font=f_head, fill=INK)
        d.text((60, 108), sub, font=f_small, fill=DIM)
        d.line([x0, 170, x0, 170 + 4 * 110 - 30], fill=GRID, width=2)
        for i, (name, v, col, tag) in enumerate(items):
            y = 180 + i * 110
            d.text((60, y + 14), name, font=f_body, fill=INK)
            w = (x1 - x0) * v / top * grow
            if w > 4:
                d.rounded_rectangle([x0, y + 8, x0 + w, y + 60], radius=4, fill=col)
                d.rectangle([x0, y + 8, x0 + min(w, 6), y + 60], fill=col)
            if grow >= 0.999:
                a = max(0.0, min(1.0, (t - 1.9) / 0.4))
                d.text((x0 + w + 16, y + 14), f'{v:,}{unit}', font=f_body, fill=mix(INK, a))
                d.text((x0 + w + 16, y + 50), tag, font=f_small, fill=mix(DIM, a))
        if note:
            for j, part in enumerate(note.split('\n')):
                d.text((60, 640 + j * 30), part, font=f_small, fill=DIM)
        save(img)


# 1. TITLE
for k in range(int(4.0 * FPS)):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    a = min(1.0, k / FPS / 0.6)
    d.text((W / 2, 290), 'Quick Hands vs Heavy Hands', font=f_title, fill=mix(INK, a), anchor='mm')
    d.text((W / 2, 360), 'The Brawler\'s two paths, worked out step by step, then fought in the game', font=f_small, fill=mix(DIM, a), anchor='mm')
    for i, c in enumerate([C_QUICK, C_WRITTEN, C_MINE, C_HIS]):
        d.rectangle([W / 2 - 110 + i * 60, 410, W / 2 - 70 + i * 60, 418], fill=mix(c, a))
    save(img)

# 2. THE BRAWLER
lines_scene('The same Brawler for all four', INK, [
    ('A regular hit does 100', 'b'),
    ('He crits 84.5% of the time (15.5% regular hits)', 'b'),
    ('A crit = 1 + 1.5 (base) + 5.4 (gear)  =  7.9 x', 'b'),
    ('So a crit does 790', 'big'),
    ('+100% attack speed: twice as many swings, if he can use it', 'b'),
], 9.0, step=1.3)

# 3. QUICK HANDS
lines_scene('Quick Hands', C_QUICK, [
    ('Speed counts as speed: 2 swings a second', 'b'),
    ('Crit stays 7.9 x  =  790', 'b'),
    ('Average hit = 15.5% x 100  +  84.5% x 790', 'b'),
    ('= 15.5 + 667.6  =  683', 'b'),
    ('683 x 2 swings  =  1,366 a second', 'big'),
], 9.0, step=1.3)

# 4. HEAVY HANDS AS WRITTEN
lines_scene('Heavy Hands, as it is now', C_WRITTEN, [
    ('1 swing a second: speed is turned into crit damage', 'b'),
    ('Each 1% of speed = 2% more crit damage, ADDED: +200% = +2.0', 'b'),
    ('Crit = 1 + 1.5 + 5.4 + 2.0  =  9.9 x  =  990', 'b'),
    ('Average hit = 15.5 + 84.5% x 990  =  852', 'b'),
    ('852 x 1 swing  =  852 a second', 'big'),
], 9.0, step=1.3, sub='added to a pile that is already big, so it gets watered down')

# 5. MINE
lines_scene("Heavy Hands, the chat's way", C_MINE, [
    ('1 swing a second', 'b'),
    ('His WHOLE crit times his speed: 7.9 x 2', 'b'),
    ('Crit = 15.8 x  =  1,580', 'b'),
    ('Average hit = 15.5 + 84.5% x 1,580  =  1,351', 'b'),
    ('1,351 x 1 swing  =  1,351 a second', 'big'),
], 9.0, step=1.3, sub='about even with Quick Hands')

# 6. HIS
lines_scene('Heavy Hands, your way', C_HIS, [
    ('1 swing a second', 'b'),
    ('The BASE crit times his speed: 2.5 x 2  =  5 x', 'b'),
    ('Then gear multiplies it: (1 + 5.4)  =  6.4', 'b'),
    ('Crit = 5 x 6.4  =  32 x  =  3,200', 'b'),
    ('Average hit = 15.5 + 84.5% x 3,200  =  2,720', 'b'),
    ('2,720 x 1 swing  =  2,720 a second', 'big'),
], 10.5, step=1.3, sub='speed and gear crit damage multiply each other')

# 7. WORKED OUT
bars_scene('Worked out', 'Damage a second, when a regular hit does 100', [
    ('Your way', 2720, C_HIS, '2.0 x Quick Hands'),
    ('Quick Hands', 1366, C_QUICK, 'the yardstick'),
    ("The chat's way", 1351, C_MINE, '1.0 x'),
    ('As it is now', 852, C_WRITTEN, '0.6 x'),
], '', 7.0)

# 8. FOUGHT
bars_scene('Fought in the game', 'His punches into one elite for 8 seconds, same gear and words; damage a second', [
    ('Your way', 1002550, C_HIS, '2.03 x Quick Hands'),
    ('Quick Hands', 493081, C_QUICK, 'the yardstick'),
    ("The chat's way", 467467, C_MINE, '0.95 x'),
    ('As it is now', 314084, C_WRITTEN, '0.64 x'),
], '', 8.0, note='Punches only. Quick Hands also lights a globe on every punch,\nso in real play it gets more flying hammerfists and knees.')

# 9. END
lines_scene('What it means', C_HIS, [
    ('Your way: half the swings, crits 4 x bigger, about 2 x the damage', 'b'),
    ('It pays off only with lots of crit chance: a real choice', 'b'),
    ('Speed and crit damage multiply, so it climbs fast', 'b'),
    ('The game counts attack speed only up to double (a cap)', 'b'),
], 8.0, step=1.3)

subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(TMP, '%05d.png'),
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', OUT], check=True)
print('frames', frame_no, 'seconds', frame_no / FPS)
