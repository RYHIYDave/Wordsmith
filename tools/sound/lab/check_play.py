"""Are the notes the lab plays in tune? Each kind of stroke, alone and dry, measured against its true pitch."""
import numpy as np
from dsp import SR
from pitch import cents_off
import gtr
import bass

rng = np.random.default_rng(0)
print('GUITAR: cents off true pitch (left guitar / right guitar), three strokes of each')
for how, held, win in (('chug', 0.0875, (0.008, 0.075)), ('pick', 0.0875, (0.008, 0.085)), ('ring', 0.875, (0.15, 0.8))):
    worst = 0
    rows = []
    for n in (38, 41, 43, 45, 46, 48, 50, 53, 55, 57, 60, 62, 65, 67, 69, 70, 72):
        vals = []
        for side in (-1, 1):
            last = {}
            for rep in range(3):
                x = gtr.stroke(n, side, how, 3, held, rng, last, 0.04) if how != 'ring' else gtr.stroke(n, side, how, 3, held, rng, last)
                c, _ = cents_off(x, n, win[0], win[1], top=2500, span=80)
                vals.append(c)
        worst = max(worst, max(abs(v) for v in vals))
        rows.append(f'{n}: ' + ' '.join(f'{v:+.0f}' for v in vals[:3]) + ' / ' + ' '.join(f'{v:+.0f}' for v in vals[3:]))
    print(f'  {how:5} worst {worst:4.1f}   ' + '   '.join(rows))

print('BASS: cents off true pitch, four notes of each')
for how, vel, held, win in (('short', 3, 0.0875, (0.01, 0.1)), ('long', 3, 0.875, (0.15, 0.8)), ('long', 1, 0.175, (0.01, 0.17)), ('long', 0, 0.175, (0.01, 0.17))):
    rows = []
    worst = 0
    for n in (26, 29, 31, 33, 34, 36):
        notes = [(i * (held if how == 'short' else held), n, how, vel) for i in range(4)]
        x = bass.play(notes, 4 * held + 0.3, seed=int(rng.integers(1, 99)))
        vals = []
        for i in range(4):
            a = i * held
            c, _ = cents_off(x, n, a + win[0], a + win[1], span=120)
            vals.append(c)
        worst = max(worst, max(abs(v) for v in vals))
        rows.append(f'{n}: ' + ' '.join(f'{v:+.0f}' for v in vals))
    print(f"  {how:5} {['pp', 'p', 'f', 'ff'][vel]:2} held {held:.3f} worst {worst:5.1f}   " + '   '.join(rows))
