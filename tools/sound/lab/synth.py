"""The band's synth: soft held chords, 'the air'. Made in code, as every synth is.

Each note is several sawtooth voices a few cents apart and spread from side to side, each drifting a little
on its own; then a low-pass filter that opens slowly and breathes; then an ensemble (three wavering copies,
as an old string machine has) and a long hall. Everything here has a twin among Web Audio's nodes:
OscillatorNode (sawtooth) with detune, BiquadFilterNode with its frequency moved in time, GainNode envelopes,
DelayNodes swept by slow oscillators, a ConvolverNode."""
import numpy as np
from scipy import signal
from dsp import SR, biquad, filt, hz
import fx


_tables = {}


def saw(freq, phase0=0.0, top=17000.0):
    """A sawtooth that cannot alias: one turn of it built from only the partials below `top` Hz, then read round
    and round at the note's speed (as an OscillatorNode reads its own table). freq: Hz for every sample."""
    size = 4096
    most = max(1, int(top / float(np.max(freq))))
    if most not in _tables:
        k = np.arange(1, most + 1)
        ph = np.arange(size) / size
        # the series of a sawtooth that falls: 2/pi * sum(sin(2 pi k x) / k), turned to rise
        _tables[most] = np.concatenate([-(2 / np.pi) * (np.sin(2 * np.pi * np.outer(ph, k)) / k).sum(axis=1), [0.0]])
        _tables[most][-1] = _tables[most][0]
    table = _tables[most]
    pos = ((phase0 + np.cumsum(freq / SR)) % 1.0) * size
    i = pos.astype(int)
    f = pos - i
    return table[i] * (1 - f) + table[i + 1] * f


def sweep(x, cutoff, q_db=0.0, block=256):
    """A two-pole low-pass whose cutoff moves (cutoff: Hz for every sample), worked in short blocks, twice over
    (so four poles: the slope a soft pad wants)."""
    y = x
    for _ in range(2):
        out = np.empty_like(y)
        zi = np.zeros((2,) + y.shape[1:]) if y.ndim > 1 else np.zeros(2)
        for i in range(0, len(y), block):
            b, a = biquad('lowpass', float(cutoff[min(i + block // 2, len(cutoff) - 1)]), q_db)
            out[i:i + block], zi = signal.lfilter(b, a, y[i:i + block], axis=0, zi=zi)
        y = out
    return y


def swell(n, attack, release, held):
    """A note's loudness: a slow rise, held, a slow fall. Seconds; returns n samples."""
    t = np.arange(n) / SR
    up = 0.5 - 0.5 * np.cos(np.pi * np.clip(t / attack, 0, 1))
    down = np.where(t > held, np.exp(-(t - held) / (release / 3.0)), 1.0)
    return up * down


def ensemble(x, depth=0.0016, mix=0.6):
    """Three copies a hundredth of a second late, each wavering slowly and a little fast, a third of a turn apart:
    one synth becomes a section. x: two sides. Returns two sides."""
    n = len(x)
    t = np.arange(n) / SR
    out = x * (1 - mix * 0.5)
    for k in range(3):
        turn = 2 * np.pi * k / 3
        late = 0.011 + depth * np.sin(2 * np.pi * 0.63 * t + turn) + depth * 0.22 * np.sin(2 * np.pi * 5.9 * t + turn * 1.7)
        pos = np.arange(n) - late * SR
        i = np.clip(np.floor(pos).astype(int), 0, n - 2)
        f = np.clip(pos - i, 0, 1)
        side = [1.0, 0.5, 0.0][k]      # how far to the right this copy sits
        for ch in range(2):
            src = x[:, ch]
            wet = src[i] * (1 - f) + src[i + 1] * f
            wet[pos < 0] = 0
            out[:, ch] += wet * mix * (side if ch == 1 else 1 - side) * 0.9
    return out


WARM = dict(voices=6, spread=11.0, drift=2.5, low=520, high=1900, open=1.6, breathe=0.12, attack=0.7, release=2.2,
            sub=0.25, octave=0.0, hp=170, ens=0.6, hall=0.55, hall_s=4.2, air_db=-2.0)
GLASS = dict(voices=6, spread=8.0, drift=2.0, low=900, high=4200, open=1.1, breathe=0.10, attack=0.5, release=2.6,
             sub=0.0, octave=0.45, hp=260, ens=0.7, hall=0.7, hall_s=5.0, air_db=1.5)

_halls = {}


def hall(seconds):
    if seconds not in _halls:
        _halls[seconds] = fx.room(seconds + 0.8, seconds, seed=11, dark=0.9, top=7000, floor=1800, pre=0.03)
    return _halls[seconds]


def pad(chords, length, p=WARM, seed=7):
    """chords: (time, held seconds, [notes]). Returns two sides, the hall included."""
    rng = np.random.default_rng(seed)
    n = int(length * SR)
    dry = np.zeros((n, 2))
    for t0, held, notes in chords:
        m = min(n - int(t0 * SR), int((held + p['release'] * 1.6) * SR))
        if m <= 0:
            continue
        tt = np.arange(m) / SR
        env = swell(m, p['attack'], p['release'], held)
        note_sum = np.zeros((m, 2))
        for note in notes:
            layers = [(note, 1.0)]
            if p['sub']:
                layers.append((note - 12, p['sub']))
            if p['octave']:
                layers.append((note + 12, p['octave']))
            for pitch, level in layers:
                for v in range(p['voices']):
                    # each voice a few cents off, drifting slowly on its own
                    off = p['spread'] * (2 * v / (p['voices'] - 1) - 1) if p['voices'] > 1 else 0.0
                    drift = p['drift'] * np.sin(2 * np.pi * rng.uniform(0.07, 0.31) * tt + rng.uniform(0, 6.28))
                    f = hz(pitch) * 2 ** ((off + drift) / 1200)
                    y = saw(f, rng.uniform(0, 1)) * level / p['voices']
                    side = 0.5 + 0.5 * (2 * v / (p['voices'] - 1) - 1) * 0.8 if p['voices'] > 1 else 0.5
                    note_sum[:, 0] += y * np.sqrt(1 - side)
                    note_sum[:, 1] += y * np.sqrt(side)
        # the filter opens as the chord swells, and breathes
        opening = 0.5 - 0.5 * np.cos(np.pi * np.clip(tt / p['open'], 0, 1))
        cutoff = (p['low'] + (p['high'] - p['low']) * opening) * (1 + p['breathe'] * np.sin(2 * np.pi * 0.17 * (tt + t0)))
        voiced = sweep(note_sum, cutoff) * env[:, None]
        a = int(t0 * SR)
        dry[a:a + m] += voiced / max(1, len(notes)) ** 0.5
    dry = filt(filt(dry, 'highpass', p['hp'], -3), 'highshelf', 5000, gain=p['air_db'])
    wide = ensemble(dry, mix=p['ens'])
    return wide + fx.reverb(wide, hall(p['hall_s']), hp=250) * p['hall']


def lead_in(chord_list, bar, hold_bars=1):
    """Chords one after another, each held a little into the next so that they melt: [(bar, [notes])] -> pad's list."""
    out = []
    for k, (b, notes) in enumerate(chord_list):
        nxt = chord_list[k + 1][0] if k + 1 < len(chord_list) else b + hold_bars
        out.append((b * bar, (nxt - b) * bar, notes))
    return out


if __name__ == '__main__':
    import sys
    from dsp import save
    from mixing import at, lufs
    from ear import hear, names
    from where import OUT
    import os
    os.makedirs(OUT + 'synth', exist_ok=True)
    BAR = 1.4
    # D minor, B flat, F, C: the sound check's chords, two bars each, spread wide
    shapes = [[50, 57, 62, 65, 69], [46, 58, 62, 65, 70], [53, 57, 60, 65, 69], [48, 55, 60, 64, 67]]
    chords = lead_in([(2 * k, shapes[k % 4]) for k in range(8)], BAR, 2)
    nm = names()
    watch = ['Synthesizer', 'Ambient music', 'New-age music', 'Organ', 'Electronic organ', 'Hammond organ', 'Drone', 'Hum', 'Buzz', 'Sine wave', 'Choir', 'String section', 'Video game music', 'Tender music', 'Sad music', 'Scary music']
    watch = [w for w in watch if w in nm]
    for name, p in (('warm', WARM), ('glass', GLASS)):
        x = pad(chords, 16 * BAR + 5.0, p)
        y = at(x, -18)
        save(OUT + f'synth/{name}.wav', y)
        h = hear(x, sizes=('mini', 'small', 'base'))
        mean = np.mean([h[s] for s in h], axis=0)
        top = np.argsort(mean)[::-1][:8]
        f, pw = signal.welch(x.mean(axis=1), SR, nperseg=16384)
        bands = []
        for c in (63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000):
            mk = (f >= c / 2 ** 0.5) & (f < c * 2 ** 0.5)
            bands.append(10 * np.log10(pw[mk].sum() + 1e-20))
        print(f'{name}: ' + ', '.join(f'{nm[k]} {mean[k]:.2f}' for k in top))
        print('    ' + ' '.join(f'{w[:10]} {mean[nm.index(w)]:.2f}' for w in watch))
        print('    octaves 63..16k against 1k: ' + ' '.join(f'{b - bands[4]:+.1f}' for b in bands) + f'   sides alike {np.corrcoef(x[:, 0], x[:, 1])[0, 1]:.2f}   peak/LUFS {20 * np.log10(np.abs(y).max()):.1f}/{lufs(y):.1f}')
