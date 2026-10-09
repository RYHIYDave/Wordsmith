"""The lab's rooms, echoes and squeezers. Each has a twin among Web Audio's nodes (convolver, delays, gains, compressor)."""
import numpy as np
from scipy import signal
from dsp import SR, filt


def room(seconds, rt60, seed=1, dark=0.45, top=9000, floor=1400, pre=0.012):
    """A room worked out in code: noise that dies away and darkens as it dies (two sides, not alike)."""
    n = int(seconds * SR)
    out = np.zeros((n, 2))
    t = np.arange(n) / SR
    for ch in range(2):
        rng = np.random.default_rng(seed * 100 + ch)
        x = rng.uniform(-1, 1, n)
        # darkening: a blend of a bright and a dull copy that moves to the dull one
        bright = filt(x, 'lowpass', top, -3)
        dull = filt(x, 'lowpass', floor, -3)
        w = np.exp(-t / dark)
        y = (bright * w + dull * (1 - w)) * 10 ** (-3 * t / rt60) * np.minimum(1, 0.25 + t / 0.006)
        k = int(pre * SR)
        out[k:, ch] = y[:n - k]
    return out / np.sqrt((out ** 2).sum(axis=0)).mean()


def reverb(x, ir, hp=250):
    """x: (n, 2) or (n,). The sound of x in the room, alone (add it to x for the mix)."""
    x2 = x if x.ndim == 2 else np.stack([x, x], axis=1)
    wet = np.stack([signal.fftconvolve(x2[:, c], ir[:, c])[:len(x2)] for c in range(2)], axis=1)
    return filt(wet, 'highpass', hp, -3)


def echo(x, time, feedback=0.45, tone=3500, taps=7):
    """An echo that bounces from side to side. Returns the echoes alone, two sides."""
    x1 = x.mean(axis=1) if x.ndim == 2 else x
    n = len(x1)
    out = np.zeros((n, 2))
    d = int(round(time * SR))
    cur = x1.copy()
    for k in range(1, taps + 1):
        cur = filt(cur, 'lowpass', tone, -3) * (1.0 if k == 1 else feedback)
        if k * d >= n:
            break
        out[k * d:, (k + 1) % 2] += cur[:n - k * d] * (0.75 if k > 1 else 1.0)
        out[k * d:, k % 2] += cur[:n - k * d] * 0.25
    return out


def chorus(x, rate=(0.6, 0.83), depth=0.0022, base=(0.012, 0.017), mix=0.5):
    """Two copies a few thousandths of a second late, the lateness wavering: one guitar becomes a shimmer. Returns two sides."""
    n = len(x)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for ch in range(2):
        delay = (base[ch] + depth * np.sin(2 * np.pi * rate[ch] * t + ch * 1.3)) * SR
        pos = np.arange(n) - delay
        i = np.clip(np.floor(pos).astype(int), 0, n - 2)
        f = np.clip(pos - i, 0, 1)
        wet = x[i] * (1 - f) + x[i + 1] * f
        wet[pos < 0] = 0
        out[:, ch] = x * (1 - mix * 0.5) + wet * mix
    return out


def squeeze(x, threshold_db=-18, ratio=4, attack=0.008, release=0.12, makeup_db=0):
    """A compressor: loud moments are turned down, so the quiet ones can come up. Works on the louder of the two sides."""
    lvl = np.abs(x).max(axis=1) if x.ndim == 2 else np.abs(x)
    a_att = np.exp(-1 / (attack * SR))
    a_rel = np.exp(-1 / (release * SR))
    env = np.zeros(len(lvl))
    e = 0.0
    # a small loop, block by block, is fast enough here
    hop = 16
    for i in range(0, len(lvl), hop):
        p = lvl[i:i + hop].max()
        a = a_att ** hop if p > e else a_rel ** hop
        e = a * e + (1 - a) * p
        env[i:i + hop] = e
    over = np.maximum(0, 20 * np.log10(np.maximum(env, 1e-9)) - threshold_db)
    gain = 10 ** ((-over * (1 - 1 / ratio) + makeup_db) / 20)
    return x * (gain[:, None] if x.ndim == 2 else gain)


def limit(x, ceiling_db=-1.5, look=0.004, release=0.08):
    """A limiter that sees a moment ahead: nothing gets past the ceiling, and nothing is clipped. It watches the
    sound between the samples too (four times as finely), since that is where a player's own peaks can hide."""
    c = 10 ** (ceiling_db / 20)
    fine = np.abs(signal.resample_poly(x, 4, 1, axis=0))
    if fine.ndim == 2:
        fine = fine.max(axis=1)
    peak = np.maximum(fine[:len(x) * 4].reshape(-1, 4).max(axis=1), np.abs(x).max(axis=1) if x.ndim == 2 else np.abs(x))
    need = np.minimum(1.0, c / np.maximum(peak, 1e-9))
    k = int(look * SR)
    # the least gain needed over the next few thousandths of a second, then eased back up
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    g = minimum_filter1d(need, size=2 * k + 1, mode='nearest')
    g = uniform_filter1d(g, size=k, mode='nearest')
    r = np.exp(-1 / (release * SR))
    out = np.empty_like(g)
    cur = 1.0
    hop = 8
    for i in range(0, len(g), hop):
        m = g[i:i + hop].min()
        cur = m if m < cur else 1 - (1 - cur) * r ** hop
        out[i:i + hop] = np.minimum(cur, g[i:i + hop])
    return x * (out[:, None] if x.ndim == 2 else out)


def shave(x, db=4.0):
    """Rounds off the very tallest peaks (the top `db` decibels), as a mixing desk driven hard does to drums: each is
    a thousandth of a second long, so nothing is heard but the drums can then be louder without a limiter ducking them."""
    peak = np.abs(x).max()
    c = peak * 10 ** (-db / 20)
    t = c * 0.6
    a = np.abs(x)
    over = a > t
    y = x.copy()
    y[over] = np.sign(x[over]) * (t + (c - t) * np.tanh((a[over] - t) / (c - t)))
    return y
