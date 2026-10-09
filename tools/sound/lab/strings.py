"""A guitar's six strings, for clean playing: one note at a time on each string, so a string struck again stops
its last note, and a new chord stops the old one, as a hand on a neck does (a keyboard lets everything ring on)."""
import numpy as np
from dsp import SR, load, put, shift, tuned, fresh, LISTING
from gtr import source, LAYERS

OPEN = [38, 45, 50, 55, 59, 64]      # drop D: the lowest string a tone down


def pluck(n, vel, held, rng, last, side=-1):
    src = source(n, side)
    key = f'gtr/{src}_{LAYERS[vel]}_{fresh(rng, last, (src, vel), 3)}'
    return shift(load(key), n - src - tuned(key, held) / 100)


def play(events, length, seed=4, side=-1, let=2.5, loose=0.004):
    """events: (time, string 0..5 (low to high), note or None to damp it, vel 0..3)."""
    rng = np.random.default_rng(seed + (side > 0) * 50)
    out = np.zeros(int(length * SR))
    last = {}
    by_string = {s: [] for s in range(6)}
    for t, s, n, vel in sorted(events, key=lambda e: (e[0], e[1])):
        by_string[s].append((t, n, vel))
    for s, evs in by_string.items():
        for k, (t, n, vel) in enumerate(evs):
            if n is None:
                continue
            t = max(0.0, t + rng.uniform(-loose, loose))
            nxt = evs[k + 1][0] if k + 1 < len(evs) else length
            held = min(let, max(0.03, nxt - t))
            x = pluck(n, vel, held, rng, last, side)
            m = min(len(x), int((held + 0.015) * SR))
            y = x[:m].copy()
            fade = min(m, int((0.015 if held < let else 0.4) * SR))
            y[-fade:] *= np.linspace(1, 0, fade) ** 2
            put(out, y, t, 1.0 + rng.normal(0, 0.06))
    return out


def strum(t, shape, down=True, vel=2, spread=0.014, strings=None, rng=None):
    """One sweep of the pick across the strings. shape: the note on each string (None: not played)."""
    idx = [s for s in range(6) if shape[s] is not None and (strings is None or s in strings)]
    order = idx if down else idx[::-1]
    ev = []
    for i, s in enumerate(order):
        # the pick slows a little as it crosses, and the first strings it meets are hit hardest
        v = max(0, vel - (1 if i >= 3 else 0))
        ev.append((t + spread * i * (1 + 0.15 * i / max(1, len(order) - 1)), s, shape[s], v))
    return ev


def damp(t, strings=range(6)):
    return [(t, s, None, 0) for s in strings]
