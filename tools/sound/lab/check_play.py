"""Are the notes the lab plays in tune? Each kind of stroke, alone and dry, measured against its true pitch.

  python3 tools/sound/lab/check_play.py          the notes of the sound check (step 1)
  python3 tools/sound/lab/check_play.py tunes    the notes the three tunes play (step 2)"""
import numpy as np
from dsp import SR
from pitch import cents_off
import gtr
import bass


def step1():
    """The notes of the sound check (try-out 2, step 1)."""
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


def step2():
    """The notes the three tunes play (tunes.py), each kind of playing alone and dry, against true pitch."""
    import strings
    import synth
    import tunes
    from dsp import hz
    rng = np.random.default_rng(0)
    chords = sorted({c for t in tunes.TUNES.values() for c in t['chords']})
    melody = sorted({k for t in tunes.TUNES.values() for _, _, k in t['melody']})
    print('STEP 2: the chords', ' '.join(chords), '; the tunes run from note', melody[0], 'to', melody[-1])
    heavy = sorted({n for c in chords for n in tunes.power(c)})
    print('HEAVY GUITARS: cents off true pitch (left guitar / right guitar), three strokes of each')
    for how, held, win in (('chug', 0.0875, (0.008, 0.075)), ('pick', 0.0875, (0.008, 0.085)), ('stab', 0.7, (0.02, 0.3)), ('ring', 0.875, (0.15, 0.8))):
        worst, rows = 0, []
        for n in heavy:
            vals = []
            for side in (-1, 1):
                last = {}
                for rep in range(3):
                    x = gtr.stroke(n, side, how, 3, held, rng, last, tunes.MUTE)
                    vals.append(cents_off(x, n, win[0], win[1], top=2500, span=80)[0])
            worst = max(worst, max(abs(v) for v in vals))
            rows.append(f'{n}: ' + ' '.join(f'{v:+.0f}' for v in vals[:3]) + ' / ' + ' '.join(f'{v:+.0f}' for v in vals[3:]))
        print(f'  {how:5} worst {worst:4.1f}   ' + '   '.join(rows))
    print('THE TUNE PICKED FAST (the fight): a note held two beats, measured over all of it; left / right, and the guitar an octave under')
    worst, rows = 0, []
    for n in melody:
        vals = []
        for side, k, seed in ((-1, n, 5), (1, n, 6), (-1, n - 12, 9)):
            x = gtr.tremolo([(0.0, 0.7, k)], 1.2, side, seed=seed)
            vals.append(cents_off(x, k, 0.03, 0.7, top=3500, span=80)[0])
        worst = max(worst, max(abs(v) for v in vals))
        rows.append(f'{n}: ' + ' '.join(f'{v:+.0f}' for v in vals))
    print(f'  worst {worst:4.1f}   ' + '   '.join(rows))
    print('THE TUNE PLUCKED (exploring), an octave down: a note held one beat, and one held four')
    for held, win in ((0.35, (0.01, 0.33)), (1.4, (0.15, 1.2))):
        worst, rows = 0, []
        for n in melody:
            vals = []
            last = {}
            for rep in range(3):
                x = strings.pluck(n - 12, 2, held, rng, last, -1)
                vals.append(cents_off(x, n - 12, win[0], win[1], top=3000, span=80)[0])
            worst = max(worst, max(abs(v) for v in vals))
            rows.append(f'{n - 12}: ' + ' '.join(f'{v:+.0f}' for v in vals))
        print(f'  held {held:.2f} s worst {worst:4.1f}   ' + '   '.join(rows))
    print('THE SOFT CHORDS (strummed and picked): every note of every chord, held a bar; left guitar (strummed) / right (picked)')
    worst, rows = 0, []
    for n in sorted({k for c in chords for k in tunes.shape(c)}):
        vals = []
        for side in (-1, 1):
            last = {}
            for vel in (1, 2):
                x = strings.pluck(n, vel, 1.4, rng, last, side)
                vals.append(cents_off(x, n, 0.15, 1.2, top=3000, span=80)[0])
        worst = max(worst, max(abs(v) for v in vals))
        rows.append(f'{n}: ' + ' '.join(f'{v:+.0f}' for v in vals[:2]) + ' / ' + ' '.join(f'{v:+.0f}' for v in vals[2:]))
    print(f'  worst {worst:4.1f}   ' + '   '.join(rows))
    print('BASS: cents off true pitch, four notes of each')
    roots = sorted({tunes.deep(c) for c in chords})
    steps = sorted({tunes.deep(c) + 7 if tunes.deep(c) + 7 <= 43 else tunes.deep(c) - 5 for c in chords})
    for label, notes_, how, vel, held, win in (('short, loud (the fight)', roots, 'short', 3, 0.0875, (0.01, 0.085)), ('long, loud (the fight)', roots, 'long', 3, 0.7, (0.15, 0.65)),
                                               ('held a bar, soft (exploring)', roots, 'long', 1, 1.4, (0.15, 1.2)), ('the step up, softest', steps, 'long', 0, 0.35, (0.02, 0.33))):
        worst, rows = 0, []
        for n in notes_:
            x = bass.play([(i * held, n, how, vel) for i in range(4)], 4 * held + 0.3, seed=int(rng.integers(1, 99)))
            vals = [cents_off(x, n, i * held + win[0], i * held + win[1], span=120)[0] for i in range(4)]
            worst = max(worst, max(abs(v) for v in vals))
            rows.append(f'{n}: ' + ' '.join(f'{v:+.0f}' for v in vals))
        print(f'  {label:30} worst {worst:5.1f}   ' + '   '.join(rows))
    print('SYNTH: one note of each patch, its middle against true pitch (its voices are set a few cents either side on purpose)')
    for name, p in (('warm', synth.WARM), ('air', synth.AIR)):
        vals = []
        for n in (55, 60, 67, 72, 79):
            x = synth.pad([(0.0, 2.0, [n])], 3.0, {**p, 'sub': 0.0, 'octave': 0.0, 'hall': 0.0}).mean(axis=1)
            vals.append(cents_off(x, n, 1.0, 2.0, top=1800 if name == 'warm' else 6000, span=40)[0])
        print(f'  {name:5} ' + ' '.join(f'{v:+.1f}' for v in vals))


if __name__ == '__main__':
    import sys
    step2() if sys.argv[1:] == ['tunes'] else step1()
