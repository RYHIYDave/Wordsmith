"""How far a recorded note is from its true pitch, in cents: found by fitting a comb of its partials to the sound,
which works even for a short low note where no single partial stands clear of its neighbours."""
import numpy as np
from dsp import SR, hz


def cents_off(x, note, lo, hi, span=130, step=1.0, top=1600, stretch=0.0):
    """x: a recording of `note`; looks at it from lo to hi seconds."""
    seg = x[int(lo * SR):int(hi * SR)].astype(np.float64)
    seg = seg - seg.mean()
    n = len(seg)
    w = np.hanning(n)
    t = np.arange(n) / SR
    want = hz(note)
    hmax = max(2, min(12, int(top / want)))
    hs = np.arange(1, hmax + 1)
    best = None
    cands = np.arange(-span, span + step / 2, step)
    scores = []
    sw = seg * w
    for c in cands:
        f = want * 2 ** (c / 1200)
        fh = f * hs * np.sqrt(1 + stretch * hs * hs)
        e = np.exp(-2j * np.pi * np.outer(fh, t))
        mag = np.abs(e @ sw)
        scores.append(np.sum(mag))
    scores = np.array(scores)
    k = int(np.argmax(scores))
    if 0 < k < len(cands) - 1:
        y0, y1, y2 = scores[k - 1:k + 2]
        d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)
    else:
        d = 0.0
    return float(cands[k] + d * step), float(scores[k] / (np.sum(np.abs(sw)) + 1e-12))


if __name__ == '__main__':
    # a test of the measure itself: made-up plucked notes of known pitch, long and short, low and high
    rng = np.random.default_rng(1)
    worst = 0
    for note in (25, 26, 29, 34, 38, 45, 57, 69, 81):
        for true in (-40, -7, 0, 12, 55):
            for lo, hi in ((0.05, 0.6), (0.01, 0.15)):
                f = hz(note) * 2 ** (true / 1200)
                t = np.arange(int(0.8 * SR)) / SR
                x = sum(rng.uniform(0.3, 1) / h * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28)) * np.exp(-t * (1 + h * 0.8)) for h in range(1, 14) if f * h < 20000)
                x = x + rng.normal(0, 0.002, len(x))
                got, _ = cents_off(x, note, lo, hi)
                worst = max(worst, abs(got - true))
                if abs(got - true) > 3:
                    print(f'note {note} true {true:+} window {lo}-{hi}: got {got:+.1f}')
    print(f'worst error {worst:.2f} cents')
