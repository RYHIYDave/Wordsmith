#!/usr/bin/env python3
"""Measures sound files: the sound chat cannot hear, so this is how it checks what it made.

  python3 tools/sound/measure.py dist/sound/tryout/*.wav
  python3 tools/sound/measure.py --bars 1.4 dist/sound/tryout/fight_full.wav   (loudness bar by bar)

For each file: how long it is, its highest peak, its loudness (LUFS, the broadcast measure, from
ffmpeg), how much of it is left on a phone's speaker (nothing under about 350 Hz), how its energy is
shared out over the octaves (against the 1 kHz octave), where its middle of brightness is, and how
alike the two sides are (1 is one-speaker sound, 0 is two unrelated sides).
"""
import re
import subprocess
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

OCTAVES = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]


def db(x):
    return 20 * np.log10(max(float(x), 1e-12))


def loudness(path):
    """Integrated loudness, loudness range and true peak, as ffmpeg's EBU R128 meter gives them."""
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    tail = out[out.rfind('Summary:'):]
    grab = lambda pat: float(re.search(pat, tail).group(1)) if re.search(pat, tail) else float('nan')
    return grab(r'I:\s+(-?[\d.]+) LUFS'), grab(r'LRA:\s+(-?[\d.]+) LU'), grab(r'Peak:\s+(-?[\d.]+) dBFS')


def read(path):
    rate, x = wavfile.read(path)
    x = x.astype(np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    return rate, x


def bands(mono, rate):
    f, p = signal.welch(mono, rate, nperseg=16384)
    out = []
    for c in OCTAVES:
        lo, hi = c / np.sqrt(2), c * np.sqrt(2)
        out.append(10 * np.log10(max(p[(f >= lo) & (f < hi)].sum(), 1e-20)))
    centre = float((f * p).sum() / max(p.sum(), 1e-20))
    return np.array(out), centre


def phone(mono, rate):
    """What a phone's own speaker keeps: next to nothing under 350 Hz, little over 9 kHz."""
    hp = signal.butter(4, 350, 'highpass', fs=rate, output='sos')
    lp = signal.butter(2, 9000, 'lowpass', fs=rate, output='sos')
    return signal.sosfilt(lp, signal.sosfilt(hp, mono))


def main():
    args = sys.argv[1:]
    per_bar = None
    if args and args[0] == '--bars':
        per_bar = float(args[1])
        args = args[2:]
    print(f"{'file':24} {'sec':>6} {'peak':>6} {'LUFS':>6} {'LRA':>4} {'truepk':>6} {'phone':>6} {'bright':>6} {'sides':>5} | " +
          ' '.join(f'{c if c < 1000 else str(c // 1000) + "k":>5}' for c in OCTAVES))
    for path in args:
        rate, x = read(path)
        mono = x.mean(axis=1)
        peak = db(np.abs(x).max())
        i, lra, tp = loudness(path)
        rms = np.sqrt((mono ** 2).mean())
        kept = db(np.sqrt((phone(mono, rate) ** 2).mean()) / max(rms, 1e-12))
        b, centre = bands(mono, rate)
        b = b - b[OCTAVES.index(1000)]
        l, r = x[:, 0], x[:, 1]
        sides = float(np.corrcoef(l, r)[0, 1]) if l.std() > 0 and r.std() > 0 else 1.0
        name = path.split('/')[-1].replace('.wav', '')
        print(f'{name:24} {len(x) / rate:6.1f} {peak:6.1f} {i:6.1f} {lra:4.1f} {tp:6.1f} {kept:6.1f} {centre:6.0f} {sides:5.2f} | ' +
              ' '.join(f'{v:5.1f}' for v in b))
        if per_bar:
            n = int(per_bar * rate)
            row = [db(np.sqrt((mono[k:k + n] ** 2).mean())) for k in range(0, len(mono) - n + 1, n)]
            print('   bar by bar (dB): ' + ' '.join(f'{v:.0f}' for v in row))


if __name__ == '__main__':
    main()
