"""The checks of a chat that cannot hear, on the finished clips (the WAVs and the MP3s made from them)."""
import os, re, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile
from scipy import signal
from ear import hear, names

def ff(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tail = out[out.rfind('Summary:'):]
    i = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
    tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))
    return i, tp

def decode(path):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        tmp = f.name
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', path, '-c:a', 'pcm_f32le', tmp], check=True)
    r, x = wavfile.read(tmp)
    os.unlink(tmp)
    return r, x.astype(np.float64)

def clicks(x, r):
    """Jumps from one sample to the next far bigger than the sound around them (a cut or a splice gone wrong)."""
    m = x.mean(axis=1) if x.ndim > 1 else x
    d = np.abs(np.diff(m))
    win = int(0.02 * r)
    local = np.sqrt(signal.convolve(d ** 2, np.ones(win) / win, mode='same')) + 1e-6
    return int(np.sum((d > 12 * local) & (d > 0.05)))

nm = names()
WATCH = ['Guitar', 'Electric guitar', 'Bass guitar', 'Drum kit', 'Heavy metal', 'Rock music', 'Distortion', 'Synthesizer', 'Electronic music', 'Drum machine', 'Keyboard (musical)', 'Electric piano', 'Piano', 'Video game music', 'Vehicle']
for path in sys.argv[1:]:
    r, x = decode(path)
    i, tp = ff(path)
    lead_in = np.argmax(np.abs(x).max(axis=1) > 0.02) / r
    quiet_end = 20 * np.log10(np.abs(x[-int(0.05 * r):]).max() + 1e-9)
    h = hear(x, rate=r, sizes=('mini', 'small', 'base'))
    mean = np.mean([h[s] for s in h], axis=0)
    top = np.argsort(mean)[::-1][:6]
    print(f'{os.path.basename(path):22} {len(x) / r:5.1f} s  {i:6.1f} LUFS  true peak {tp:5.1f} dBFS  starts at {lead_in * 1000:4.0f} ms  ends at {quiet_end:6.1f} dB  clicks {clicks(x, r)}')
    print('    hears: ' + ', '.join(f'{nm[k]} {mean[k]:.2f}' for k in top))
    print('    ' + ' | '.join(f"{w} {'/'.join(f'{h[s][nm.index(w)]:.2f}' for s in h)}" for w in WATCH))
