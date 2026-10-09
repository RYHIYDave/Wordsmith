"""The lab's tools: the same filters and squashing curves the game's sound engine has (Web Audio),
worked in numpy, so that a sound can be tried here quickly and then built there the same way."""
import json
import numpy as np
from scipy import signal
from scipy.io import wavfile

from where import BANK

SR = 48000
LISTING = json.load(open(BANK + 'bank.json'))
_cache = {}


def load(key):
    if key not in _cache:
        r, x = wavfile.read(BANK + key + '.wav')
        _cache[key] = x.astype(np.float64) / 32768
    return _cache[key]


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def tuned(key, held):
    """How many cents sharp this recording sounds when it is held for `held` seconds. A string struck hard is
    sharp at first and settles as it rings, so a short note is judged by its first moments and a long one by
    how it rings on (the bank has both measures for every guitar and bass note)."""
    e = LISTING[key]
    if 'early' not in e:
        return 0.0
    w = min(1.0, max(0.0, (held - 0.12) / 0.6))
    return e['early'] * (1 - w) + e['late'] * w


def fresh(rng, last, slot, count):
    """Which take of a recording to play: any but the one this slot played last, so no two strokes in a row
    are the same recording and no pattern of takes comes round."""
    take = int(rng.integers(1, count + 1))
    if count > 1 and take == last.get(slot):
        take = take % count + 1
    last[slot] = take
    return take


def biquad(kind, f0, q=0.7071, gain=0.0, sr=SR):
    """One of Web Audio's BiquadFilterNode filters, with its own formulas (for lowpass and highpass its Q is in dB)."""
    w = 2 * np.pi * f0 / sr
    c, s = np.cos(w), np.sin(w)
    a_lin = 10 ** (gain / 40)
    if kind in ('lowpass', 'highpass'):
        alpha = s / (2 * 10 ** (q / 20))
        if kind == 'lowpass':
            b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
        else:
            b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
        a = [1 + alpha, -2 * c, 1 - alpha]
    elif kind == 'peaking':
        alpha = s / (2 * q)
        b = [1 + alpha * a_lin, -2 * c, 1 - alpha * a_lin]
        a = [1 + alpha / a_lin, -2 * c, 1 - alpha / a_lin]
    elif kind == 'notch':
        alpha = s / (2 * q)
        b = [1, -2 * c, 1]
        a = [1 + alpha, -2 * c, 1 - alpha]
    elif kind == 'bandpass':
        alpha = s / (2 * q)
        b = [alpha, 0, -alpha]
        a = [1 + alpha, -2 * c, 1 - alpha]
    elif kind == 'lowshelf':
        sq = 2 * np.sqrt(a_lin) * s / np.sqrt(2)      # Web Audio's shelves have a fixed slope (S = 1)
        b = [a_lin * ((a_lin + 1) - (a_lin - 1) * c + sq), 2 * a_lin * ((a_lin - 1) - (a_lin + 1) * c), a_lin * ((a_lin + 1) - (a_lin - 1) * c - sq)]
        a = [(a_lin + 1) + (a_lin - 1) * c + sq, -2 * ((a_lin - 1) + (a_lin + 1) * c), (a_lin + 1) + (a_lin - 1) * c - sq]
    elif kind == 'highshelf':
        sq = 2 * np.sqrt(a_lin) * s / np.sqrt(2)
        b = [a_lin * ((a_lin + 1) + (a_lin - 1) * c + sq), -2 * a_lin * ((a_lin - 1) + (a_lin + 1) * c), a_lin * ((a_lin + 1) + (a_lin - 1) * c - sq)]
        a = [(a_lin + 1) - (a_lin - 1) * c + sq, 2 * ((a_lin - 1) - (a_lin + 1) * c), (a_lin + 1) - (a_lin - 1) * c - sq]
    else:
        raise ValueError(kind)
    return np.array(b) / a[0], np.array(a) / a[0]


def filt(x, kind, f0, q=0.0, gain=0.0):
    b, a = biquad(kind, f0, q if kind in ('lowpass', 'highpass') else (q or 0.7071), gain)
    return signal.lfilter(b, a, x, axis=0)


def squash(x, drive, bias=0.0, over=4):
    """tanh, as a WaveShaperNode with a tanh curve and oversampling does it."""
    up = signal.resample_poly(x, over, 1, axis=0)
    y = np.tanh(drive * up + bias) - np.tanh(bias)
    return signal.resample_poly(y, 1, over, axis=0)


def shift(x, semitones):
    """A recording played faster or slower, as an AudioBufferSourceNode's playbackRate does."""
    if abs(semitones) < 1e-9:
        return x
    ratio = 2 ** (semitones / 12)
    n = int(round(len(x) / ratio))
    t = np.arange(n) * ratio
    i = np.minimum(t.astype(int), len(x) - 2)
    f = t - i
    return x[i] * (1 - f) + x[i + 1] * f


def put(track, x, t, gain=1.0):
    """Adds a sound into a track at time t (seconds)."""
    i = int(round(t * SR))
    n = min(len(x), len(track) - i)
    if n > 0:
        track[i:i + n] += x[:n] * gain


def db(x):
    return 20 * np.log10(max(float(x), 1e-12))


def save(path, x, peak=None):
    x = np.asarray(x, dtype=np.float64)
    if peak is not None:
        x = x * (10 ** (peak / 20) / max(np.abs(x).max(), 1e-9))
    wavfile.write(path, SR, x.astype(np.float32))
