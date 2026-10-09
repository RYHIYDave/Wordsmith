#!/usr/bin/env python3
"""Draws a sound file, so that someone who cannot hear it can look at it.

  python3 tools/sound/picture.py dist/sound/tryout/fight_breaks_out.wav shots/sound/fight_breaks_out.png [--bar 1.4] [--from 10 --to 20]

Top: how loud it is over time. Below: which pitches sound when (low at the bottom, high at the top,
brighter is louder). With --bar, a line every four bars.
"""
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal
from scipy.io import wavfile


def main():
    args = sys.argv[1:]
    opts = {}
    while len(args) > 2:
        opts[args[-2]] = float(args[-1])
        args = args[:-2]
    src, out = args
    rate, x = wavfile.read(src)
    x = x.astype(np.float64)
    mono = x.mean(axis=1) if x.ndim > 1 else x
    a = int(opts.get('--from', 0) * rate)
    b = int(opts.get('--to', len(mono) / rate) * rate)
    mono = mono[a:b]
    t0 = a / rate
    short = (b - a) / rate < 6
    nfft = 2048 if short else 4096
    f, t, s = signal.spectrogram(mono, rate, nperseg=nfft, noverlap=nfft - (128 if short else 512), window='hann')
    s_db = 10 * np.log10(np.maximum(s, 1e-14))
    top = s_db.max()
    fig, (ax0, ax1) = plt.subplots(2, 1, figsize=(15, 8), gridspec_kw={'height_ratios': [1, 4]}, sharex=True)
    hop = max(1, int(rate * 0.005))
    env = np.array([np.abs(mono[k:k + hop]).max() for k in range(0, len(mono), hop)])
    ax0.fill_between(t0 + np.arange(len(env)) * hop / rate, -env, env, color='#2b7a78', linewidth=0)
    ax0.set_ylim(-1.05, 1.05)
    ax0.set_ylabel('level')
    ax0.set_title(src.split('/')[-1])
    ax1.pcolormesh(t0 + t, f, s_db, vmin=top - 75, vmax=top, cmap='magma', shading='auto')
    ax1.set_yscale('log')
    ax1.set_ylim(40, 16000)
    ax1.set_yticks([50, 100, 200, 350, 500, 1000, 2000, 4000, 8000, 16000])
    ax1.set_yticklabels(['50', '100', '200', '350', '500', '1k', '2k', '4k', '8k', '16k'])
    ax1.axhline(350, color='white', linewidth=0.5, linestyle=':')
    ax1.set_ylabel('pitch (Hz); under the dotted line a phone is silent')
    ax1.set_xlabel('seconds')
    bar = opts.get('--bar')
    if bar:
        k = 0
        while k * bar <= t0 + len(mono) / rate:
            if k * bar >= t0:
                for ax in (ax0, ax1):
                    ax.axvline(k * bar, color='white' if ax is ax1 else 'black', linewidth=0.9 if k % 4 == 0 else 0.25, alpha=0.7 if k % 4 == 0 else 0.4)
            k += 1
    fig.tight_layout()
    fig.savefig(out, dpi=80)
    print('drawn', out)


if __name__ == '__main__':
    main()
