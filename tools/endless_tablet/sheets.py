"""The sheets for him: the tablet, the portal, the boss (two sheets). Each 1080 wide, big enough to read on a phone."""
import sys
from PIL import Image, ImageDraw
from kit import font, wrap
import tablet
import portal
import bosses

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
W = 1080
BG = (16, 13, 30)
PANEL = (42, 34, 48)
FG = (235, 232, 245)
DIM = (176, 170, 204)
ORANGE = (255, 150, 60)


def text_block(d, x, y, title, words, width, tsize=36, wsize=27):
    d.text((x, y), title, font=font(tsize), fill=ORANGE)
    y += tsize + 10
    for l in wrap(words, wsize, width):
        d.text((x, y), l, font=font(wsize), fill=DIM)
        y += wsize + 7
    return y


def header(d, text, size=40):
    y = 24
    for l in wrap(text, size, W - 40):
        d.text((20, y), l, font=font(size), fill=FG)
        y += size + 10
    return y + 10


def on_panel(img, pad=0):
    bg = Image.new('RGBA', (img.width + pad * 2, img.height + pad * 2), PANEL + (255,))
    bg.alpha_composite(img, (pad, pad))
    return bg


def tablet_sheet():
    probe = Image.new('RGB', (W, 4000), BG)
    d = ImageDraw.Draw(probe)
    y = header(d, 'THE TABLET: three takes. Each: its four quarters as the bosses drop them, then set together and at work.')
    for name, words, take in tablet.TAKES:
        a = on_panel(tablet.quarters_apart(take).image().crop((12, 12, 88, 88)).resize((304, 304), Image.NEAREST))
        w = on_panel(tablet.whole(take).image().crop((12, 12, 88, 88)).resize((304, 304), Image.NEAREST))
        probe.paste(a, (20, y), a)
        probe.paste(w, (20 + 304 + 12, y), w)
        tx = 20 + 304 * 2 + 30
        text_block(d, tx, y, name, words, W - tx - 20, tsize=30, wsize=25)
        y += 304 + 28
    return probe.crop((0, 0, W, y))


def portal_sheet():
    probe = Image.new('RGB', (W, 4000), BG)
    d = ImageDraw.Draw(probe)
    y = header(d, 'THE PORTAL: three takes, painted over the Shaft’s Rim on the landing at the end of the tongue. (They show tablet A; any tablet goes with any portal.)')
    for name, words, fn in portal.TAKES:
        p = portal.base()
        fn(p)
        im = p.image().crop((37, 8, 237, 192))
        im = im.resize((im.width * 5 // 2, im.height * 5 // 2), Image.NEAREST)
        probe.paste(im, (20, y))
        text_block(d, 20 + im.width + 20, y, name, words, W - 60 - im.width, tsize=30, wsize=25)
        y += im.height + 30
    return probe.crop((0, 0, W, y))


def boss_sheet(pair, title):
    probe = Image.new('RGB', (W, 4000), BG)
    d = ImageDraw.Draw(probe)
    y = header(d, title)
    b = Image.open('brawler.png')
    ims = []
    ps = [bosses.boss_panel(t, b) for t in pair]
    sc = min(2.5, (W - 60) / sum(p.w for p in ps))
    for t, p in zip(pair, ps):
        ims.append((t, on_panel(p.image(4).resize((int(p.w * sc), int(p.h * sc)), Image.NEAREST))))
    x = 20
    gap = W - 40 - sum(im.width for _, im in ims)
    hmax = max(im.height for _, im in ims)
    for (t, im) in ims:
        probe.paste(im, (x, y + hmax - im.height), im)
        x += im.width + gap
    y += hmax + 14
    x = 20
    yb = y
    for (t, im) in ims:
        yb = max(yb, text_block(d, x, y, t[0], t[1], im.width - 14, tsize=30, wsize=24))
        x += im.width + gap
    return probe.crop((0, 0, W, yb + 20))


if __name__ == '__main__' and len(sys.argv) <= 2:
    tablet_sheet().save(f'{OUT}/endless_1_tablet.png')
    portal_sheet().save(f'{OUT}/endless_2_portal.png')
    boss_sheet(bosses.TAKES[:2], 'THE FINAL BOSS: four takes, each beside the Brawler for size. (Rough sketches, to pick a way; the one you pick is then drawn properly.)').save(f'{OUT}/endless_3_boss_a.png')
    boss_sheet(bosses.TAKES[2:], 'THE FINAL BOSS, takes 3 and 4, beside the Brawler.').save(f'{OUT}/endless_4_boss_b.png')
    for n in ('endless_1_tablet', 'endless_2_portal', 'endless_3_boss_a', 'endless_4_boss_b'):
        print(n, Image.open(f'{OUT}/{n}.png').size)


def runes_sheet():
    probe = Image.new('RGB', (W, 1200), BG)
    d = ImageDraw.Draw(probe)
    y = header(d, 'THE TABLET, B WITH RUNES: each boss guards one of the wordsmith\u2019s own runes. As they drop, cut dark; set together, the four burn cyan.')
    a = on_panel(tablet.quarters_apart(tablet.take_b_runes).image().crop((12, 12, 88, 88)).resize((510, 510), Image.NEAREST))
    w = on_panel(tablet.whole(tablet.take_b_runes).image().crop((12, 12, 88, 88)).resize((510, 510), Image.NEAREST))
    probe.paste(a, (20, y), a)
    probe.paste(w, (W - 20 - 510, y), w)
    d.text((20, y + 516), 'the four quarters, as they drop', font=font(24), fill=DIM)
    d.text((W - 20 - 510, y + 516), 'set together', font=font(24), fill=DIM)
    return probe.crop((0, 0, W, y + 560))


def beast_sheet(pair, title):
    import beasts
    probe = Image.new('RGB', (W, 4000), BG)
    d = ImageDraw.Draw(probe)
    y = header(d, title, size=36)
    b = Image.open('brawler.png')
    for t in pair:
        p = beasts.beast_panel(t, b)
        sc = (W - 40) / p.w
        im = on_panel(p.image(4).resize((int(p.w * sc), int(p.h * sc)), Image.NEAREST))
        probe.paste(im, (20, y), im)
        y += im.height + 10
        y = text_block(d, 20, y, t[0], t[1], W - 40, tsize=30, wsize=25) + 24
    return probe.crop((0, 0, W, y))
