"""Looks for amp settings the listening models take for a real heavy guitar: a climb from a sensible start,
one or two knobs changed at a time, kept when the riff reads more like 'Electric guitar', 'Distortion' and 'Heavy metal'.
Every knob stays inside the range a real amp or speaker box has.

  python3 tools/sound/lab/search_amp.py [seed] [rounds]

gtr.RHYTHM came from two such climbs on 9 Oct 2026 (seeds 21 and 7), with the gain then eased by hand so that fast
strokes stay apart. The riff, the tuning of the bank and the choice of takes have changed since, so a new climb
will not land on the same numbers."""
import json
import sys
import time
import numpy as np
from scipy import signal
from dsp import SR
import gtr
from gtr import RHYTHM, STEP
from ear import hear, names
from sounds import heavy_riff, BAR

RANGE = dict(tight=(90, 220), mid_f=(550, 1100), mid_db=(2, 14), g1=(8, 120), bias=(0, 0.35), g2=(2, 20), g3=(1, 6),
             bass_db=(-2, 8), scoop_f=(400, 900), scoop_db=(-10, 2), treble_db=(-3, 6), thump_db=(0, 9),
             bite_f=(1800, 3800), bite_db=(-2, 7), top=(3800, 6800), top_order=(2, 4))
WANT = {'Electric guitar': 1.0, 'Distortion': 1.0, 'Heavy metal': 2.0, 'Rock music': 1.0}
NOT = {'Synthesizer': 1.0, 'Electronic music': 1.0, 'Sampler': 1.0, 'Noise': 1.0, 'Static': 1.0, 'Buzz': 0.5, 'Hum': 0.5}


def render(p):
    """The heavy riff on both guitars, through an amp with these settings."""
    strokes, bars = heavy_riff()
    total = bars * BAR + 1.5
    left = gtr.amp(gtr.play(strokes, total, -1), p)
    right = gtr.amp(gtr.play(strokes, total, +1), p)
    return np.stack([left * 0.9 + right * 0.1, right * 0.9 + left * 0.1], axis=1)


def bands(x):
    mono = x.mean(axis=1)
    f, p = signal.welch(mono, SR, nperseg=8192)
    out = {}
    for c in (125, 250, 500, 1000, 2000, 4000, 8000):
        out[c] = 10 * np.log10(max(p[(f >= c / 2 ** 0.5) & (f < c * 2 ** 0.5)].sum(), 1e-20))
    return {c: out[c] - out[1000] for c in out}


def score(p, sizes=('mini', 'small')):
    x = render(p)
    nm = names()
    bar = int(16 * STEP * SR)
    total = 0
    for a, b in ((0, 4), (4, 8), (8, 12)):
        h = hear(x[a * bar:b * bar], SR, sizes)
        mean = np.mean([h[s] for s in sizes], axis=0)
        total += sum(w * mean[nm.index(k)] for k, w in WANT.items()) - sum(w * mean[nm.index(k)] for k, w in NOT.items())
    b = bands(x)
    # harsh or thin is no good, whatever the models say: too much at 4 kHz and up, or no weight at 125 Hz
    harsh = max(0, b[4000] - 0) * 0.05 + max(0, b[8000] + 14) * 0.05 + max(0, -8 - b[125]) * 0.03
    return total / 3 - harsh, b


def main():
    rng = np.random.default_rng(int(sys.argv[1]) if len(sys.argv) > 1 else 7)
    rounds = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    best = dict(RHYTHM)
    best_s, b = score(best)
    print(f'start {best_s:.3f}', {k: round(v, 1) for k, v in b.items()}, flush=True)
    t0 = time.time()
    for i in range(rounds):
        p = dict(best)
        for k in rng.choice(list(RANGE), size=rng.integers(1, 4), replace=False):
            lo, hi = RANGE[k]
            if k == 'top_order':
                p[k] = int(rng.integers(lo, hi + 1))
            elif k in ('g1', 'g2', 'g3', 'tight', 'mid_f', 'scoop_f', 'bite_f', 'top'):
                p[k] = float(np.clip(p[k] * np.exp(rng.normal(0, 0.25)), lo, hi))
            else:
                p[k] = float(np.clip(p[k] + rng.normal(0, (hi - lo) * 0.18), lo, hi))
        s, b = score(p)
        mark = ''
        if s > best_s:
            best, best_s, mark = p, s, '  <-- kept'
        print(f'{i:3} {s:.3f}{mark}  ' + ' '.join(f'{k}={v:.3g}' for k, v in p.items() if v != RHYTHM.get(k)) + f'  [{time.time() - t0:.0f}s]', flush=True)
    print('BEST', best_s, json.dumps({k: (round(v, 3) if isinstance(v, float) else v) for k, v in best.items()}), flush=True)


if __name__ == '__main__':
    main()
