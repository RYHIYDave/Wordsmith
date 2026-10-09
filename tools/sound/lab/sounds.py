"""Try-out 2, step 1: the band's sounds on their own, for the owner to judge whether they sound real.
Real recorded instruments (public domain), played from lists of notes; the amps, rooms and echoes are code."""
import sys
import numpy as np
from dsp import SR, save, filt
import gtr
import bass
import fx
import strings
from drums import Kit, thrash, soft
from mixing import at, wide, centre, lufs
from ear import say
from where import OUT

BEAT = 0.35
STEP = BEAT / 4
BAR = BEAT * 4
HALL = fx.room(3.2, 2.6, seed=1)
BOOTH = fx.room(0.7, 0.5, seed=2, dark=0.2, floor=3000)
TAIL = 3.0

D, BB, F, C = 38, 46, 41, 48


def fifth(root):
    return [root, root + 7, root + 12]


def heavy_riff():
    """Twelve bars in drop D: four galloping, four of ringing chords, four of a line picked on every sixteenth."""
    s = []
    for b in range(4):
        root = [D, D, F, F + 2][b]
        for beat in range(4):
            t = b * BAR + beat * BEAT
            if b % 2 == 1 and beat == 3:
                s.append((t, fifth(root + 2), 'ring', 3))
                continue
            s.append((t, fifth(root), 'chug', 3))
            s.append((t + 2 * STEP, fifth(root), 'chug', 2))
            s.append((t + 3 * STEP, fifth(root), 'chug', 2))
    for b, root in zip(range(4, 8), [D, BB, F, C]):
        s.append((b * BAR, fifth(root), 'ring', 3))
        s.append((b * BAR + 10 * STEP, fifth(root), 'ring', 3))
    line = [62, 65, 69, 67, 62, 65, 70, 69, 65, 69, 72, 70, 67, 69, 65, 64]
    for b in range(8, 12):
        for i in range(16):
            s.append((b * BAR + i * STEP, [line[(b - 8) * 4 + i // 4]], 'pick', 3 if i % 4 == 0 else 2))
    # the ending: one last chord, left to ring for a bar, then a hand on the strings
    s.append((12 * BAR, fifth(D), 'ring', 3))
    s.append((13 * BAR, [], 'stop', 0))
    return s, 12


def guitars(strokes, bars, amp=gtr.RHYTHM):
    total = bars * BAR + TAIL
    left = gtr.amp(gtr.play(strokes, total, -1), amp)
    right = gtr.amp(gtr.play(strokes, total, +1), amp)
    g = wide(left, right)
    return g + fx.reverb(g, BOOTH) * 0.12


def bass_for(strokes, bars):
    notes = []
    for t, ns, how, vel in strokes:
        if how == 'stop':
            notes.append((t, 0, 'stop', 0))
            continue
        n = min(ns)
        while n > 45:
            n -= 12
        n -= 12
        if n < 25:
            n += 12
        notes.append((t, n, 'short' if how in ('chug', 'pick') else 'long', 3))
    return centre(bass.amp(bass.play(notes, bars * BAR + TAIL)))


def drums_thrash(bars, ways, mix=None, end=True):
    kit = Kit(bars * BAR + TAIL)
    for b in range(bars):
        thrash(kit, b * BAR, b, ways[b], fill=(b % 4 == 3), crash=(b % 2 == 0))
    if end:
        # the ending: one last hit together
        kit.hit('kick', bars * BAR, 1.0)
        kit.hit('crash', bars * BAR, 1.0, pan=-0.3)
        kit.hit('china', bars * BAR, 0.9)
    d = kit.mix(mix)
    return fx.shave(fx.squeeze(d + fx.reverb(d, BOOTH, hp=300) * 0.18, -16, 3, 0.012, 0.1))


def drums_soft(bars):
    kit = Kit(bars * BAR + TAIL)
    for b in range(bars):
        soft(kit, b * BAR, b)
    kit.hit('kick', bars * BAR, 0.55)
    kit.hit('crash2', bars * BAR, 0.5, pan=0.3)
    d = kit.mix(dict(kick_click=3, kick_box=-4, kick_push=1.0, snare_push=1.0, over=1.1, cymbals=0.6, hats=0.6, kick_tick=9))
    return d + fx.reverb(d, BOOTH, hp=300) * 0.25 + fx.reverb(d, HALL) * 0.08


# The hand's shape for each chord on the six strings, low to high (drop D; None: a string left out)
SHAPES = {'Dm': [38, 45, 50, 57, 62, 65], 'Bb': [None, 46, 53, 58, 62, 65], 'F': [41, 48, 53, 57, 60, 65], 'C': [None, 48, 52, 55, 60, 64]}
PROG = ('Dm', 'Bb', 'F', 'C')
STRUM = 'D.DU.UDU'      # on the eighths: down, down-up, up-down-up


def soft_strum(bars, prog=PROG, side=-1):
    """The first guitar holding back: chords strummed on the eighths, the amp on the edge of breaking up."""
    ev = []
    for b in range(bars):
        sh = SHAPES[prog[b % len(prog)]]
        for e, c in enumerate(STRUM):
            t = b * BAR + e * 2 * STEP
            if c == 'D':
                ev += strings.strum(t, sh, True, 2 if e in (0, 4) else 1)
            elif c == 'U':
                ev += strings.strum(t, sh, False, 1, spread=0.010, strings=(2, 3, 4, 5))
    ev += strings.strum(bars * BAR, SHAPES[prog[0]], True, 2, spread=0.022)      # the ending: one slow last chord
    x = gtr.edge(strings.play(ev, bars * BAR + TAIL, side=side), **BRIGHT)
    c = fx.chorus(x, mix=0.25)
    return c + fx.reverb(c, HALL) * 0.14


# The second guitar picks the same chords' upper four strings, one at a time
UPPER = {'Dm': [50, 57, 62, 65], 'Bb': [53, 58, 62, 65], 'F': [53, 57, 60, 65], 'C': [52, 55, 60, 64]}
PICKING = [0, 2, 1, 3, 2, 1, 3, 2]
# The soft guitars' speaker: brighter and less boxy than the plain one (light and airy is what he asked of exploring)
BRIGHT = dict(scoop_f=400, scoop=-6, bite=6, top=6500, order=2)


def soft_arp(bars, prog=PROG, side=1):
    """The second guitar: the chord's notes picked one string at a time, clean, with shimmer and a long echo."""
    ev = []
    for b in range(bars):
        sh = UPPER[prog[b % len(prog)]]
        if b:
            ev += strings.damp(b * BAR - 0.03)
        for e in range(8):
            s = PICKING[e]
            ev.append((b * BAR + e * 2 * STEP, s + 2, sh[s], 3 if e in (0, 4) else 2))
    ev += strings.damp(bars * BAR - 0.03)
    ev.append((bars * BAR, 5, UPPER[prog[0]][3], 2))
    x = gtr.clean(strings.play(ev, bars * BAR + TAIL, side=side), **BRIGHT)
    c = fx.chorus(x, mix=0.3)
    return c + fx.echo(c, 3 * STEP, 0.42) * 0.3 + fx.reverb(c, HALL) * 0.3


def soft_guitars(bars, pan=0.55):
    """Both, one to each side."""
    a = at(soft_strum(bars), -23)
    b = at(soft_arp(bars), -23)
    n = min(len(a), len(b))
    return a[:n] * np.array([1.0, 1 - pan]) + b[:n] * np.array([1 - pan, 1.0])


PHRASE = [  # (beat, beats, note): a line to sing over Dm, Bb, F, C
    (0, 1, 69), (1, 3, 74), (4, 2, 77), (6, 1, 76), (7, 1, 74), (8, 3, 72), (11, 1, 69), (12, 2, 67), (14, 2, 69),
    (16, 1, 74), (17, 3, 77), (20, 2, 81), (22, 1, 79), (23, 1, 77), (24, 3, 79), (27, 1, 77), (28, 4, 76)]


def lead(bars, amp, start_bar=0, phrase=PHRASE, joined=True):
    notes = [(start_bar * BAR + b * BEAT, d * BEAT, n) for b, d, n in phrase if b < bars * 4]
    x = gtr.amp(gtr.sing(notes, (start_bar + bars) * BAR + TAIL, joined=joined), amp)
    c = centre(x)
    return c + fx.echo(c, 3 * STEP, 0.4) * 0.3 + fx.reverb(c, HALL) * 0.28


def master(x, ceiling=-1.5):
    x = filt(x, 'highpass', 32, -3)
    return fx.limit(x, ceiling)


def soft_bass(bars, roots=(26, 34, 29, 36)):
    """The bass under the soft band: the chord's root on every eighth, played lightly."""
    notes = [(b * BAR + e * 2 * STEP, roots[b % len(roots)], 'long', 1 if e % 4 == 0 else 0) for b in range(bars) for e in range(8)]
    notes.append((bars * BAR, roots[0], 'long', 1))
    return centre(bass.amp(bass.play(notes, bars * BAR + TAIL), dict(grit=2, high=0.2)))


def together(*parts):
    n = min(len(p) for p in parts)
    return sum(p[:n] for p in parts)


def trim(x, floor=-60.0, keep=0.25):
    """Cuts the silence off the end (anything quieter than `floor` dB below the loudest moment)."""
    level = np.abs(x).max(axis=1)
    loud = np.nonzero(level > level.max() * 10 ** (floor / 20))[0]
    return x[:min(len(x), loud[-1] + int(keep * SR))]


def clips():
    out = {}
    strokes, bars = heavy_riff()
    g = at(guitars(strokes, bars), -19)
    b = at(bass_for(strokes, bars), -21)
    ways = ['gallop'] * 4 + ['halftime'] * 4 + ['race'] * 2 + ['blast'] * 2
    d = at(drums_thrash(bars, ways), -16.5)
    lf = at(lead(8, gtr.LEAD, start_bar=4), -20)
    out['band_full'] = together(g, b, d, lf)
    out['heavy_guitars'] = g
    out['bass'] = b
    # the drums: the four ways, four bars each, then the soft way
    kit_ways = ['gallop'] * 4 + ['race'] * 4 + ['halftime'] * 4 + ['blast'] * 4
    dt = at(drums_thrash(16, kit_ways, end=False), -17.5)
    ds = at(drums_soft(4), -22)
    k = int(16 * BAR * SR)
    both = np.zeros((k + len(ds), 2))
    m = min(len(dt), len(both))
    both[:m] += dt[:m]
    both[k:] += ds
    out['drums'] = both
    # the band holding back
    sg = at(soft_guitars(8), -22)
    out['soft_guitar'] = sg
    out['band_soft'] = together(sg, at(drums_soft(8), -22), at(soft_bass(8), -24), at(lead(8, gtr.LEAD_SOFT, joined=False), -22))
    # the lead alone: four bars held back, then the same four at full
    half = [(b, d, n) for b, d, n in PHRASE if b < 16]
    l1 = at(lead(4, gtr.LEAD_SOFT, phrase=half, joined=False), -22)
    l2 = at(lead(4, gtr.LEAD, start_bar=4, phrase=half), -19)
    both = np.zeros((max(len(l1), len(l2)), 2))
    both[:len(l1)] += l1
    both[:len(l2)] += l2
    out['lead'] = both
    return {name: trim(x) for name, x in out.items()}


WATCH = ['Heavy metal', 'Rock music', 'Electric guitar', 'Distortion', 'Drum kit', 'Bass guitar', 'Guitar', 'Synthesizer', 'Electronic music', 'Video game music', 'Vehicle', 'Independent music', 'New-age music', 'Tender music']

if __name__ == '__main__':
    import os
    os.makedirs(OUT + 'sounds', exist_ok=True)
    cs = clips()
    for name, x in cs.items():
        # each clip on its own at the same comfortable loudness, with nothing over the top
        loud = at(x, -16.0)
        y = master(loud)
        fade = int(0.2 * SR)
        y[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
        save(OUT + f'sounds/{name}.wav', y)
        held = 20 * np.log10(np.abs(loud).max() / np.abs(y).max())
        end = 20 * np.log10(np.abs(loud[-int(0.5 * SR):]).max() + 1e-9)
        print(f'{name:14} {len(y) / SR:5.1f} s  {lufs(y):6.1f} LUFS  peak {20 * np.log10(np.abs(y).max()):5.1f}   the limiter took off {held:4.1f} dB at most   last half second before the fade {end:6.1f} dB')
    for name in cs:
        say(name.ljust(14), cs[name], WATCH, sizes=('small', 'base'), top=5)
