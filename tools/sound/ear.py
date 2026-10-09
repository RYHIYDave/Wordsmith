#!/usr/bin/env python3
"""A borrowed ear: asks a listening model what a sound file sounds like.

The sound chat cannot hear. This runs CED-mini, a small open model trained to name what is in a
sound out of 527 everyday kinds ("Music", "Heavy metal", "Synthesizer", "Static", "Beep, bleep"...),
over a file ten seconds at a time. It is no judge of taste: it only says what the sound would be
taken for, which catches a tune that reads as noise, or a lead that reads as a whistle.

  python3 tools/sound/ear.py <model dir> dist/sound/tryout/dream.wav [...]   [--top 12] [--each] [--watch]

--each prints every ten seconds on its own; --watch adds a fixed row of kinds worth keeping an eye on
(is it metal, is it noise, is it a whistle), so that two versions can be set side by side.

The model is not in the repository (47 MB). It is the file
sherpa-onnx-ced-mini-audio-tagging-2024-04-19.tar.bz2 of the "audio-tagging-models" release of
github.com/k2-fsa/sherpa-onnx (the model is github.com/RicherMans/CED, Apache 2.0); unpack it and
give its folder. The sound is prepared as that model's own example does (16 kHz, 64 mel bands, dB).
"""
import csv
import sys

import numpy as np
import onnxruntime as ort
from scipy import signal
from scipy.io import wavfile

WATCH = ['Music', 'Heavy metal', 'Rock music', 'Electronic music', 'Video game music', 'New-age music', 'Ambient music',
         'Drum kit', 'Drum machine', 'Electric guitar', 'Synthesizer', 'Exciting music', 'Happy music', 'Tender music',
         'Sad music', 'Scary music', 'Angry music', 'Noise', 'Static', 'Sine wave', 'Beep, bleep', 'Ringtone', 'Whistle', 'Theremin']

RATE = 16000
N_FFT = 512
HOP = 160
N_MELS = 64


def mel_bank():
    """The triangle filters torchaudio's MelSpectrogram uses (HTK mel scale, no normalising)."""
    freqs = np.linspace(0, RATE / 2, N_FFT // 2 + 1)
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    pts = 700 * (10 ** (np.linspace(mel(0), mel(8000), N_MELS + 2) / 2595) - 1)
    diff = pts[1:] - pts[:-1]
    slopes = pts[None, :] - freqs[:, None]
    down = -slopes[:, :-2] / diff[:-1]
    up = slopes[:, 2:] / diff[1:]
    return np.maximum(0, np.minimum(down, up))


def features(mono, rate):
    x = signal.resample_poly(mono, RATE, rate) if rate != RATE else mono
    x = np.pad(x, N_FFT // 2, mode='reflect')
    window = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(N_FFT) / N_FFT)
    n = 1 + (len(x) - N_FFT) // HOP
    frames = np.lib.stride_tricks.sliding_window_view(x, N_FFT)[::HOP][:n] * window
    power = np.abs(np.fft.rfft(frames, axis=1)) ** 2
    mel = power @ mel_bank()
    d = 10 * np.log10(np.maximum(mel, 1e-10))
    d = np.maximum(d, d.max() - 120)
    return d.T.astype(np.float32)


def main():
    args = sys.argv[1:]
    top, each, watch = 12, False, False
    if '--watch' in args:
        watch = True
        args.remove('--watch')
    if '--top' in args:
        i = args.index('--top')
        top = int(args[i + 1])
        del args[i:i + 2]
    if '--each' in args:
        each = True
        args.remove('--each')
    model_dir, files = args[0], args[1:]
    with open(model_dir + '/class_labels_indices.csv') as f:
        names = [row['display_name'] for row in csv.DictReader(f)]
    sess = ort.InferenceSession(model_dir + '/model.onnx', providers=['CPUExecutionProvider'])
    for path in files:
        rate, x = wavfile.read(path)
        x = x.astype(np.float64)
        if x.dtype.kind == 'i':
            x = x / 32768.0
        mono = x.mean(axis=1) if x.ndim > 1 else x
        feats = features(mono, rate)
        probs = []
        for start in range(0, feats.shape[1] - 300, 1000):
            chunk = feats[:, start:start + 1000]
            p = sess.run(None, {'feats': chunk[None]})[0][0]
            probs.append(p)
            if each:
                order = np.argsort(p)[::-1][:6]
                print(f'   {start / 100:5.1f} s: ' + ', '.join(f'{names[k]} {p[k]:.2f}' for k in order))
        mean = np.mean(probs, axis=0)
        order = np.argsort(mean)[::-1][:top]
        print(path.split('/')[-1] + ': ' + ', '.join(f'{names[k]} {mean[k]:.2f}' for k in order))
        if watch:
            print('   watch: ' + ', '.join(f'{w} {mean[names.index(w)]:.2f}' for w in WATCH if w in names and mean[names.index(w)] >= 0.005))


if __name__ == '__main__':
    main()
