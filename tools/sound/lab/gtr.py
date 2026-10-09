"""The lab's guitars: one real guitar's recordings (made straight from the guitar, no amp), played from
lists of strokes and notes, then put through amps made of filters and squashing curves.
Everything here has a twin among Web Audio's nodes."""
import numpy as np
from dsp import SR, load, put, filt, squash, shift, tuned, fresh, LISTING

SAMPLED = sorted({int(k.split('/')[1].split('_')[0]) for k in LISTING if k.startswith('gtr/') and 'muted' not in k})
LAYERS = ['p', 'mp', 'mf', 'f']
BEAT = 0.35
STEP = BEAT / 4


def source(n, side):
    """Which recorded note to play note n from. The left guitar reaches up from the recording below, the
    right one reaches down from the recording above, so the two never play the same recording at once."""
    below = max([s for s in SAMPLED if s <= n], default=SAMPLED[0])
    above = min([s for s in SAMPLED if s > n], default=SAMPLED[-1])
    if side < 0 or above - n > 3:
        return below
    return above


def stroke(n, side, how, vel, held, rng, last, mute_tau=0.04):
    """One string, struck once: the recording (moved to pitch, and to true pitch), shaped by how it is played."""
    src = source(n, side)
    key = f'gtr/{src}_{LAYERS[vel]}_{fresh(rng, last, (src, vel), 3)}'
    # a palm-muted note is over in a moment, so it is tuned by how it begins
    heard = {'chug': 0.08, 'stab': min(held, 0.3)}.get(how, held)
    x = shift(load(key), n - src - tuned(key, heard) / 100)
    t = np.arange(len(x)) / SR
    if how == 'chug':
        # the palm on the strings: the note's brightness is gone in a hundredth of a second, the note soon after
        dull = filt(x, 'lowpass', 900, -3)
        bright = np.exp(-t / 0.010)
        x = (x * bright + dull * (1 - bright)) * np.exp(-t / mute_tau)
    elif how == 'stab':
        x = x * np.exp(-t / 0.25)
    return x


def play(strokes, length, side, seed=1, mute_tau=0.04, loose=0.004, thunk=0.35):
    """strokes: (time, [notes], how, vel). how: chug, ring, pick, stab, or stop. Each new stroke stops the last one,
    as a pick on ringing strings does."""
    rng = np.random.default_rng(seed + (side > 0) * 100)
    out = np.zeros(int(length * SR))
    last = {}
    strokes = sorted(strokes, key=lambda s: s[0])
    for k, (t, notes, how, vel) in enumerate(strokes):
        t = max(0, t + rng.uniform(-loose, loose))
        nxt = strokes[k + 1][0] if k + 1 < len(strokes) else length
        dur = max(0.02, nxt - t)
        if how == 'stop':       # the hand laid on the strings: the last stroke ends here, and nothing new begins
            continue
        for n in notes:
            x = stroke(n, side, how, vel, dur, rng, last, mute_tau)
            m = min(len(x), int((dur + 0.012) * SR))
            x = x[:m].copy()
            fade = int(0.012 * SR)
            if m > fade:
                x[-fade:] *= np.linspace(1, 0, fade)
            put(out, x, t, 1.0 + rng.normal(0, 0.04))
        if how == 'chug' and thunk > 0:
            # the dead thump of the pick on damped strings: a recording of exactly that
            put(out, load(f'gtr/muted{rng.integers(1, 6)}_{rng.integers(1, 6)}'), t, thunk * [0.4, 0.6, 0.8, 1.0][vel])
    return out


def read(x, cents):
    """Plays a recording with its pitch moved as it goes (cents, one for every sample of the result): slides and wobble."""
    rate = 2 ** (cents / 1200)
    pos = np.cumsum(rate) - rate[0]
    ok = pos < len(x) - 2
    i = np.minimum(pos.astype(int), len(x) - 2)
    f = pos - i
    return (x[i] * (1 - f) + x[i + 1] * f) * ok


def sing(notes, length, seed=2, vel=3, wobble=16, slide=0.07, joined=True):
    """A lead line: (time, length, note). A note that follows straight on from the last slides up or down to
    its pitch without a new stroke of the pick, and a held note begins to wobble, as a singer's does."""
    rng = np.random.default_rng(seed)
    out = np.zeros(int(length * SR))
    notes = sorted(notes)
    last = {}
    for k, (t, dur, n) in enumerate(notes):
        prev = notes[k - 1] if joined and k > 0 and abs(notes[k - 1][0] + notes[k - 1][1] - t) < 1e-6 else None
        src = min(SAMPLED, key=lambda s: (abs(s - n), s))
        key = f'gtr/{src}_{LAYERS[vel]}_{fresh(rng, last, src, 3)}'
        x = load(key)
        m = int((dur + 0.08) * SR)
        tt = np.arange(m) / SR
        # a note slid into has no stroke of its own, so it is tuned as a note ringing on
        cents = np.full(m, (n - src) * 100.0 - tuned(key, 1.0 if prev is not None else dur))
        if prev is not None:
            e = np.clip(tt / slide, 0, 1)
            cents += (prev[2] - n) * 100 * (1 - e * e * (3 - 2 * e))
        cents += wobble * np.clip((tt - 0.22) / 0.35, 0, 1) * np.sin(2 * np.pi * 5.4 * tt + rng.uniform(0, 6.28))
        start = int(0.03 * SR) if prev is not None else 0
        y = read(x[start:], cents)
        attack = int((0.02 if prev is not None else 0.002) * SR)
        y[:attack] *= np.linspace(0, 1, attack)
        rel = int(0.07 * SR)
        y[-rel:] *= np.linspace(1, 0, rel)
        put(out, y, max(0, t + rng.uniform(-0.003, 0.003)))
    return out


def ring(notes, length, seed=4, let=1.6, side=-1):
    """Notes picked one at a time and left to ring over each other: (time, note, vel 0..3)."""
    rng = np.random.default_rng(seed)
    out = np.zeros(int(length * SR))
    last = {}
    for k, (t, n, vel) in enumerate(sorted(notes)):
        src = source(n, side)
        key = f'gtr/{src}_{LAYERS[vel]}_{fresh(rng, last, (src, vel), 3)}'
        x = shift(load(key), n - src - tuned(key, let) / 100)
        m = min(len(x), int(let * SR))
        y = x[:m].copy()
        rel = int(0.5 * SR)
        y[-rel:] *= np.linspace(1, 0, rel) ** 2
        put(out, y, max(0, t + rng.uniform(-0.005, 0.005)), 1.0 + rng.normal(0, 0.06))
    return out


def amp(x, p):
    """A high-gain amp and its speaker box."""
    # before the amp: lows cut (so they do not flub), mids pushed, like a boost pedal
    y = filt(x, 'highpass', p['tight'], -3)
    y = filt(y, 'peaking', p['mid_f'], 0.7, p['mid_db'])
    y = filt(y, 'lowpass', 6500, -3)
    # three stages of squashing with filters between
    y = squash(y * p['g1'], 1.0, p['bias'])
    y = filt(y, 'highpass', 90, -3)
    y = filt(y, 'lowpass', 7000, -3)
    y = squash(y * p['g2'], 1.0)
    y = filt(y, 'highpass', 70, -3)
    y = squash(y * p['g3'], 1.0)
    # the amp's tone knobs
    y = filt(y, 'lowshelf', 140, gain=p['bass_db'])
    y = filt(y, 'peaking', p['scoop_f'], 0.8, p['scoop_db'])
    y = filt(y, 'highshelf', 3200, gain=p['treble_db'])
    # the speaker box: a thump low down, bite in the upper middle, nothing above five thousand
    y = filt(y, 'highpass', 80, -3)
    y = filt(y, 'highpass', 80, -3)
    y = filt(y, 'peaking', 118, 1.4, p['thump_db'])
    y = filt(y, 'peaking', 380, 1.2, -2.5)
    y = filt(y, 'peaking', p['bite_f'], 1.6, p['bite_db'])
    y = filt(y, 'peaking', 4300, 3.0, 2.0)
    for _ in range(p.get('top_order', 3)):
        y = filt(y, 'lowpass', p['top'], -3)
    return y


def box(y, top=5000, order=3, low=2.0, scoop_f=480, scoop=-3.0, bite=3.0):
    """A clean amp's speaker box: without it a guitar plugged straight in is taken for an electric piano."""
    y = filt(filt(y, 'highpass', 85, -3), 'highpass', 85, -3)
    y = filt(y, 'peaking', 110, 1.2, low)
    y = filt(y, 'peaking', scoop_f, 0.9, scoop)
    y = filt(y, 'peaking', 2800, 1.2, bite)
    for _ in range(order):
        y = filt(y, 'lowpass', top, -3)
    return y


def clean(x, push=2.2, **speaker):
    """A clean amp and its speaker: the guitar as it is, its loudest moments rounded off."""
    y = filt(x, 'highpass', 95, -3)
    y = squash(y * push, 1.0, 0.05) / min(push, 1.6)
    return box(y, **speaker)


def edge(x, push=6.0, **speaker):
    """The same amp turned up until it is on the edge of breaking up: a little hair on every stroke."""
    y = filt(x, 'highpass', 110, -3)
    y = filt(y, 'peaking', 900, 0.7, 4)
    y = squash(y * push, 1.0, 0.1)
    y = squash(y * 1.5, 1.0)
    return box(y, **speaker)


# the wall: what the search for 'a real heavy guitar' settled on, with the gain eased so that fast strokes stay apart
RHYTHM = dict(tight=131, mid_f=780, mid_db=8, g1=24, bias=0.22, g2=5, g3=2.5, bass_db=5, scoop_f=678, scoop_db=-7.3, treble_db=3.9,
              thump_db=2.3, bite_f=3793, bite_db=3.2, top=5200, top_order=4)
# the lead at full: more middle, less bite, a rounder top, so it sings over the wall
LEAD = dict(tight=200, mid_f=1000, mid_db=9, g1=30, bias=0.15, g2=5, g3=2.0, bass_db=0, scoop_f=600, scoop_db=-1, treble_db=0,
            thump_db=0, bite_f=2400, bite_db=2, top=4200, top_order=3)
# the lead held back: only on the edge of breaking up
LEAD_SOFT = dict(tight=160, mid_f=900, mid_db=5, g1=9, bias=0.12, g2=2.0, g3=1.3, bass_db=0, scoop_f=600, scoop_db=0, treble_db=0,
                 thump_db=0, bite_f=2400, bite_db=1, top=4000, top_order=2)
