"""The borrowed ears, for the lab: three sizes of the same open listening model."""
import csv
import numpy as np
import onnxruntime as ort
from scipy import signal

from where import EAR as E

MODELS = {s: E + f'sherpa-onnx-ced-{s}-audio-tagging-2024-04-19' for s in ('mini', 'small', 'base')}
_sess = {}
_names = None


def names():
    global _names
    if _names is None:
        with open(MODELS['mini'] + '/class_labels_indices.csv') as f:
            _names = [r['display_name'] for r in csv.DictReader(f)]
    return _names


def _bank():
    freqs = np.linspace(0, 8000, 257)
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    pts = 700 * (10 ** (np.linspace(mel(0), mel(8000), 66) / 2595) - 1)
    diff = pts[1:] - pts[:-1]
    slopes = pts[None, :] - freqs[:, None]
    return np.maximum(0, np.minimum(-slopes[:, :-2] / diff[:-1], slopes[:, 2:] / diff[1:]))


def feats(mono, rate):
    x = signal.resample_poly(mono, 16000, rate)
    x = np.pad(x, 256, mode='reflect')
    w = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(512) / 512)
    n = 1 + (len(x) - 512) // 160
    fr = np.lib.stride_tricks.sliding_window_view(x, 512)[::160][:n] * w
    m = (np.abs(np.fft.rfft(fr, axis=1)) ** 2) @ _bank()
    d = 10 * np.log10(np.maximum(m, 1e-10))
    return np.maximum(d, d.max() - 120).T.astype(np.float32)


def hear(x, rate=48000, sizes=('mini', 'small', 'base')):
    """What each model takes the sound for: {size: array of 527 likelihoods}, averaged over ten-second stretches."""
    mono = x.mean(axis=1) if x.ndim > 1 else x
    f = feats(mono, rate)
    out = {}
    for s in sizes:
        if s not in _sess:
            _sess[s] = ort.InferenceSession(MODELS[s] + '/model.onnx', providers=['CPUExecutionProvider'])
        probs = [_sess[s].run(None, {'feats': f[None, :, a:a + 1000]})[0][0] for a in range(0, max(1, f.shape[1] - 300), 1000)]
        out[s] = np.mean(probs, axis=0)
    return out


def say(label, x, watch, rate=48000, sizes=('mini', 'small', 'base'), top=6):
    h = hear(x, rate, sizes)
    nm = names()
    mean = np.mean([h[s] for s in sizes], axis=0)
    order = np.argsort(mean)[::-1][:top]
    print(f'{label}: ' + ', '.join(f'{nm[k]} {mean[k]:.2f}' for k in order))
    print('    ' + ' | '.join(f'{w} ' + '/'.join(f'{h[s][nm.index(w)]:.2f}' for s in sizes) for w in watch))
    return {w: float(mean[nm.index(w)]) for w in watch}
