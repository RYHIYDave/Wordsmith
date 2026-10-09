"""The checks of a chat that cannot hear, on a tune's clip: each stretch of it (exploring, the fight, exploring
again) measured and named by the listening models.

  python3 tools/sound/lab/check_music.py <clip.wav or .mp3> [seconds the fight starts at] [seconds it ends at]"""
import os
import re
import subprocess
import sys
import tempfile
import numpy as np
from scipy import signal
from scipy.io import wavfile
from ear import hear, names

WATCH = ['Heavy metal', 'Rock music', 'Guitar', 'Electric guitar', 'Drum kit', 'Bass guitar', 'Synthesizer', 'Keyboard (musical)', 'Piano', 'Ambient music', 'New-age music', 'Background music', 'Video game music', 'Happy music', 'Sad music', 'Tender music', 'Exciting music', 'Angry music', 'Scary music', 'Vehicle']


def decode(path):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        tmp = f.name
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', path, '-c:a', 'pcm_f32le', tmp], check=True)
    r, x = wavfile.read(tmp)
    os.unlink(tmp)
    return r, x.astype(np.float64)


def loud(x, r):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        tmp = f.name
    wavfile.write(tmp, r, x.astype(np.float32))
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.unlink(tmp)
    tail = out[out.rfind('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))


def bands(x, r):
    f, p = signal.welch(x.mean(axis=1), r, nperseg=16384)
    out = []
    for c in (63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000):
        m = (f >= c / 2 ** 0.5) & (f < c * 2 ** 0.5)
        out.append(10 * np.log10(p[m].sum() + 1e-20))
    return out


def phone_kept(x, r):
    """How much of the sound a phone's own speaker keeps (next to nothing under 350 Hz)."""
    sos = signal.butter(4, 350, 'highpass', fs=r, output='sos')
    y = signal.sosfilt(sos, x, axis=0)
    return 10 * np.log10(np.mean(y ** 2) / np.mean(x ** 2))


def clicks(x, r):
    m = x.mean(axis=1)
    d = np.abs(np.diff(m))
    win = int(0.02 * r)
    local = np.sqrt(signal.convolve(d ** 2, np.ones(win) / win, mode='same')) + 1e-6
    return int(np.sum((d > 12 * local) & (d > 0.05)))


def report(label, x, r, nm):
    i, tp = loud(x, r)
    b = bands(x, r)
    h = hear(x, rate=r, sizes=('mini', 'small', 'base'))
    mean = np.mean([h[s] for s in h], axis=0)
    top = np.argsort(mean)[::-1][:7]
    print(f'{label:16} {len(x) / r:5.1f} s  {i:6.1f} LUFS  true peak {tp:5.1f}  a phone keeps {phone_kept(x, r):5.1f} dB  sides alike {np.corrcoef(x[:, 0], x[:, 1])[0, 1]:.2f}')
    print('    octaves 63 to 16k against 1k: ' + ' '.join(f'{v - b[4]:+.1f}' for v in b))
    print('    hears: ' + ', '.join(f'{nm[k]} {mean[k]:.2f}' for k in top))
    print('    ' + ' | '.join(f'{w} {mean[nm.index(w)]:.2f}' for w in WATCH if mean[nm.index(w)] >= 0.02))
    return i


if __name__ == '__main__':
    path = sys.argv[1]
    tf = float(sys.argv[2]) if len(sys.argv) > 2 else 22.4
    tz = float(sys.argv[3]) if len(sys.argv) > 3 else 44.8
    r, x = decode(path)
    nm = names()
    print(f'{os.path.basename(path)}: clicks {clicks(x, r)}; starts at {1000 * np.argmax(np.abs(x).max(axis=1) > 0.01) / r:.0f} ms; ends at {20 * np.log10(np.abs(x[-int(0.05 * r):]).max() + 1e-9):.1f} dB')
    report('the whole clip', x, r, nm)
    a = report('exploring', x[:int(tf * r)], r, nm)
    f = report('the fight', x[int(tf * r):int(tz * r)], r, nm)
    report('exploring again', x[int(tz * r):], r, nm)
    print(f'the fight is {f - a:.1f} LU louder than the exploring before it')
