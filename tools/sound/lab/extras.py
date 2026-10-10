"""Try-out 2, step 2: the two small clips beside the tunes.

  python3 tools/sound/lab/extras.py     (into dist/sound/lab/music/)

- heavier.wav: the heavy guitars with bass and drums, first as the sound check had them, then heavier (his word
  for clip 1 of the sound check: "Heavier"). The same eight bars twice, each as loud as the other, so that what
  is judged is the weight and the bite and not the volume.
- synth.wav: the synth alone, the same chords twice: as it plays while you explore (warm), then as it plays in a
  fight (thin and bright, to sit over the wall of guitars)."""
import os
import numpy as np
from dsp import SR, save
import gtr
import bass
import fx
import synth
from drums import Kit, thrash
from mixing import at, wide, centre, lufs
from sounds import BEAT, STEP, BAR, BOOTH, master, together, trim
import tunes
from tunes import riff, wall, deep, power, voiced, bass_heavy
from where import OUT

WAYS = ['gallop'] * 4 + ['halftime'] * 4


def band(chords, old):
    """Eight bars of guitars, bass and drums over these chords: as the sound check had them, or as step 2 has them."""
    bars = len(chords)
    total = bars * BAR + 3.0
    g, b = [], []
    for k, name in enumerate(chords):
        for (dt, notes, how, vel) in riff(name, WAYS[k], k):
            # (the sound check was a tone higher: the lowest string at D)
            up = 2 if old else 0
            g.append((k * BAR + dt, [x + up for x in notes], how, vel))
            b.append((k * BAR + dt, deep(name) + up - (12 if old and deep(name) + up > 33 else 0), 'short' if how in ('chug', 'pick') else 'long', 3))
    home = chords[0]
    up = 2 if old else 0
    g += [(bars * BAR, [x + up for x in power(home)], 'ring', 3), (bars * BAR + 1.4, [], 'stop', 0)]
    b += [(bars * BAR, b[0][1], 'long', 3), (bars * BAR + 1.4, 0, 'stop', 0)]
    kit = Kit(total, seed=3)
    for k in range(bars):
        thrash(kit, k * BAR, k, WAYS[k], fill=(k % 4 == 3), crash=(k % 2 == 0))
    kit.hit('kick', bars * BAR, 1.0)
    kit.hit('crash', bars * BAR, 1.0, pan=-0.3)
    d = kit.mix()
    d = fx.shave(fx.squeeze(d + fx.reverb(d, BOOTH, hp=300) * 0.18, -16, 3, 0.012, 0.1))
    if old:
        low = centre(bass.amp(bass.play(b, total)))
        return together(at(wall(g, total, old=True), -19), at(low, -21), at(d, -16.5))
    return together(at(wall(g, total), tunes.LOUD['heavy guitars']), at(bass_heavy(b, total), tunes.LOUD['heavy bass']), at(d, tunes.LOUD['heavy drums']))


def heavier():
    chords = ['C', 'C', 'F', 'F', 'C', 'C', 'G', 'G']
    a = trim(at(band(chords, old=True), -16.0), floor=-45)
    b = trim(at(band(chords, old=False), -16.0), floor=-45)
    gap = np.zeros((int(0.6 * SR), 2))
    return np.concatenate([a, gap, b]), len(a) / SR, len(a) / SR + 0.6


def colours():
    chords = synth.lead_in(voiced(tunes.TUNES['a']['chords'][:8]), BAR, 2)
    total = 8 * BAR + 5.0
    a = trim(at(synth.pad(chords, total, synth.WARM), -18.0), floor=-45)
    b = trim(at(synth.pad(chords, total, synth.AIR), -18.0), floor=-45)
    gap = np.zeros((int(0.4 * SR), 2))
    return np.concatenate([a, gap, b]), len(a) / SR, len(a) / SR + 0.4


if __name__ == '__main__':
    os.makedirs(OUT + 'music', exist_ok=True)
    for name, make in (('heavier', heavier), ('synth', colours)):
        x, first_ends, second_starts = make()
        y = master(x)
        fade = int(0.2 * SR)
        y[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
        save(OUT + f'music/{name}.wav', y)
        k = int(first_ends * SR)
        print(f'{name}: {len(y) / SR:.1f} s; the first part ends at {first_ends:.1f} s and the second starts at {second_starts:.1f} s; '
              f'first {lufs(y[:k]):.1f} LUFS, second {lufs(y[int(second_starts * SR):]):.1f} LUFS; peak {20 * np.log10(np.abs(y).max()):.1f} dB', flush=True)
