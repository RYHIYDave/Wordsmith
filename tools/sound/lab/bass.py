"""The lab's bass guitar: the real bass's recordings (held notes and short ones), through a little grit."""
import numpy as np
from dsp import SR, load, put, filt, squash, shift, tuned, fresh, LISTING

SAMPLED = sorted({int(k.split('/')[1].split('_')[0]) for k in LISTING if k.startswith('bass/') and 'short' not in k})


# The lowest recorded note is the bass's E string tuned down to C sharp and played open: a slack string. Struck
# hard and short it swoops by more than a semitone (measured: 80 to 150 cents sharp, and not steady), so short
# notes never come from it.
SHORTS = [s for s in SAMPLED if s != SAMPLED[0]]


def play(notes, length, seed=5):
    """notes: (time, note, how, vel 0..3). how: 'short' (a picked sixteenth), 'long' (held till the next) or 'stop'."""
    rng = np.random.default_rng(seed)
    out = np.zeros(int(length * SR))
    notes = sorted(notes)
    last = {}
    for k, (t, n, how, vel) in enumerate(notes):
        t = max(0, t + rng.uniform(-0.003, 0.003))
        nxt = notes[k + 1][0] if k + 1 < len(notes) else length
        held = max(0.03, nxt - t)
        if how == 'stop':
            continue
        if how == 'short':
            src = min(SHORTS, key=lambda s: (abs(s - n), s))
            key = f'bass/{src}_short_{fresh(rng, last, (src, how), 5)}'
            x = shift(load(key), n - src - tuned(key, 0.1) / 100) * [0.35, 0.55, 0.8, 1.0][vel]
        else:
            src = min(SAMPLED, key=lambda s: (abs(s - n), s))
            key = f"bass/{src}_{['pp', 'p', 'f', 'ff'][vel]}_{fresh(rng, last, (src, vel), 4)}"
            x = shift(load(key), n - src - tuned(key, held) / 100)
        m = min(len(x), int((held + 0.02) * SR))
        x = x[:m].copy()
        fade = int(0.01 * SR)
        if m > fade:
            x[-fade:] *= np.linspace(1, 0, fade)
        put(out, x, t)
    return out


def amp(x, p=None):
    p = {**AMP, **(p or {})}
    low = filt(filt(x, 'lowpass', p['split'], -3), 'highpass', 30, -3)
    high = filt(x, 'highpass', p['split'], -3)
    high = squash(filt(high, 'peaking', 900, 0.8, 4) * p['grit'], 1.0)
    high = filt(filt(high, 'lowpass', p['top'], -3), 'lowpass', p['top'], -3)
    y = np.tanh(low * p['low_push']) / np.tanh(p['low_push']) * p['low'] + high * p['high']
    y = filt(y, 'peaking', 80, 1.0, p['thump'])
    y = filt(y, 'peaking', 320, 1.0, -3)
    return y


# (with more grit than this the listening models begin to take the bass for a synthesizer)
AMP = dict(split=220, grit=2, top=4500, low=1.0, low_push=1.5, high=0.3, thump=3)
