#!/usr/bin/env python3
"""Makes the band's instrument bank from three free sound packs (recordings of real instruments).

  python3 tools/sound/make_bank.py <packs dir> <bank dir>
  python3 tools/sound/make_bank.py --tune <bank dir>        (measures the tuning again, of a bank already made)

The packs are not in the repository (they are hundreds of megabytes). All three are CC0 1.0, given to
the public domain by their maker, Karoryfer Samples, and kept at github.com/sfzinstruments:
  - karoryfer.emilyguitar: an Epiphone electric guitar, recorded direct (no amp), every third
    semitone from Db2 to D6, four loudnesses, three takes of each; and its muted strokes;
  - karoryfer.growlybass: a Squier Jazz Bass, recorded direct: held notes (four loudnesses, four
    takes) and short ones (five takes);
  - karoryfer.big-rusty-drums: a drum kit hit by hit, each hit through a close microphone and a pair
    overhead. Only the hits a rock drummer uses are taken.
Each recording is copied into the bank as a 48 kHz, 16-bit WAV with a plain name, and bank.json lists
them: for each, how long it is and how loud its peak is. Nothing is changed but the sample rate
(and long tails are cut where the list below says so).

THE TUNING. A string struck hard sounds sharp at first and settles as it rings, and these were struck
hard: measured here, the guitar's low notes at their loudest are 20 to 30 cents sharp over their first
tenth of a second, and the bass's two lowest notes, played short, 47 to 154 (up to a semitone and a
half). So each guitar and bass recording is measured
twice, and bank.json keeps both: `early`, how many cents sharp it is in its first moments (0.01 to
0.12 s; the bass 0.01 to 0.15 s), and `late`, as it rings on (0.15 to 0.8 s). Whoever plays the bank
moves each note by the one that fits how long the note is held, so short notes and long ones agree.
"""
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

RATE = 48000
NOTE = {'c': 0, 'db': 1, 'd': 2, 'eb': 3, 'e': 4, 'f': 5, 'gb': 6, 'g': 7, 'ab': 8, 'a': 9, 'bb': 10, 'b': 11}


def midi(name, octave_up=0):
    m = re.match(r'^([a-g]b?)(\d)$', name)
    return 12 * (int(m.group(2)) + 1 + octave_up) + NOTE[m.group(1)]


def jobs(packs):
    """Yields (source file, key in the bank, longest it may be in seconds)."""
    g = f'{packs}/karoryfer.emilyguitar'
    for f in sorted(os.listdir(f'{g}/notes')):
        m = re.match(r'^([a-g]b?\d)_(p|mp|mf|f)_rr(\d)\.wav$', f)
        if m:
            yield f'{g}/notes/{f}', f'gtr/{midi(m.group(1))}_{m.group(2)}_{m.group(3)}', 4.2
    for f in sorted(os.listdir(f'{g}/noises')):
        m = re.match(r'^muted(\d)_rr(\d)\.wav$', f)
        if m:
            yield f'{g}/noises/{f}', f'gtr/muted{m.group(1)}_{m.group(2)}', 0.4
    b = f'{packs}/karoryfer.growlybass'
    for f in sorted(os.listdir(f'{b}/sustain')):
        m = re.match(r'^([a-g]b?\d)_(pp|p|f|ff)_rr(\d)\.wav$', f)
        if m:
            # the pack writes a bass's notes an octave above where they sound
            yield f'{b}/sustain/{f}', f'bass/{midi(m.group(1), -1)}_{m.group(2)}_{m.group(3)}', 3.5
    for f in sorted(os.listdir(f'{b}/staccato')):
        m = re.match(r'^([a-g]b?\d)_staccato_rr(\d)\.wav$', f)
        if m:
            yield f'{b}/staccato/{f}', f'bass/{midi(m.group(1), -1)}_short_{m.group(2)}', 0.45
    d = f'{packs}/karoryfer.big-rusty-drums/Samples'
    drums = [
        ('kick_24/kick/kick', 'kick/close', 1.2), ('kick_24/kick/oh', 'kick/over', 1.2),
        ('snare_14/center/top', 'snare/top', 1.5), ('snare_14/center/btm', 'snare/under', 1.5), ('snare_14/center/oh', 'snare/over', 1.5),
        ('snare_14/rimshot/top', 'rimshot/top', 1.5), ('snare_14/rimshot/btm', 'rimshot/under', 1.5), ('snare_14/rimshot/oh', 'rimshot/over', 1.5),
        ('snare_14/sidestick/top', 'sidestick/top', 0.8), ('snare_14/sidestick/oh', 'sidestick/over', 0.8),
        ('hihat_14/tc/cl', 'hat_tight/close', 0.6), ('hihat_14/tc/oh', 'hat_tight/over', 0.6),
        ('hihat_14/cl/cl', 'hat_shut/close', 0.8), ('hihat_14/cl/oh', 'hat_shut/over', 0.8),
        ('hihat_14/ho/cl', 'hat_half/close', 2.0), ('hihat_14/ho/oh', 'hat_half/over', 2.0),
        ('hihat_14/open/cl', 'hat_open/close', 3.0), ('hihat_14/open/oh', 'hat_open/over', 3.0),
        ('hihat_14/chik/cl', 'hat_foot/close', 0.6), ('hihat_14/chik/oh', 'hat_foot/over', 0.6),
        ('ride_22/rd/cl', 'ride/close', 4.0), ('ride_22/rd/oh', 'ride/over', 4.0),
        ('ride_22/bl/cl', 'ride_bell/close', 4.0), ('ride_22/bl/oh', 'ride_bell/over', 4.0),
        ('crash_17/cr/cl', 'crash/close', 6.0), ('crash_17/cr/oh', 'crash/over', 6.0),
        ('crash_sizzle_17/cr/cl', 'crash2/close', 6.0), ('crash_sizzle_17/cr/oh', 'crash2/over', 6.0),
        ('china_18/cn/cl', 'china/close', 4.0), ('china_18/cn/oh', 'china/over', 4.0),
        ('tom_14/center/cl', 'tom1/close', 2.0), ('tom_14/center/oh', 'tom1/over', 2.0),
        ('tom_15/center/cl', 'tom2/close', 2.2), ('tom_15/center/oh', 'tom2/over', 2.2),
        ('tom_18/center/cl', 'tom3/close', 2.5), ('tom_18/center/oh', 'tom3/over', 2.5),
        ('tom_22/center/cl', 'tom4/close', 3.0), ('tom_22/center/oh', 'tom4/over', 3.0),
    ]
    for src, key, longest in drums:
        if not os.path.isdir(f'{d}/{src}'):
            print('missing in the pack:', src)
            continue
        for f in sorted(os.listdir(f'{d}/{src}')):
            m = re.search(r'_vl(\d+)_rr(\d+)\.flac$', f)
            if m:
                yield f'{d}/{src}/{f}', f'drums/{key}/{int(m.group(1))}_{m.group(2)}', longest


def cents_off(x, rate, note, lo, hi, top=2000.0, most=8):
    """How many cents sharp a recording of `note` is, from lo to hi seconds: found by fitting a comb of
    its partials to the sound, which works even for a short low note where no partial stands clear."""
    import numpy as np
    seg = x[int(lo * rate):int(hi * rate)]
    seg = (seg - seg.mean()) * np.hanning(len(seg))
    t = np.arange(len(seg)) / rate
    want = 440 * 2 ** ((note - 69) / 12)
    hs = np.arange(1, max(2, min(most, int(top / want))) + 1)

    def score(c):
        f = want * 2 ** (c / 1200) * hs
        return float(np.abs(np.exp(-2j * np.pi * np.outer(f, t)) @ seg).sum())

    coarse = np.arange(-150.0, 150.1, 5.0)
    c0 = coarse[int(np.argmax([score(c) for c in coarse]))]
    fine = np.arange(c0 - 6, c0 + 6.01, 0.5)
    sc = [score(c) for c in fine]
    k = int(np.argmax(sc))
    d = 0.0
    if 0 < k < len(fine) - 1:
        y0, y1, y2 = sc[k - 1], sc[k], sc[k + 1]
        d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)
    return round(float(fine[k] + d * 0.5), 1)


def tune(bank, listing):
    """Measures every guitar and bass note in the bank and writes its `early` and `late` into the listing."""
    import numpy as np
    from scipy.io import wavfile
    todo = [k for k in sorted(listing) if re.match(r'^(gtr|bass)/\d+_', k)]

    def one(key):
        rate, x = wavfile.read(f'{bank}/{key}.wav')
        x = x.astype(np.float64) / 32768
        note = int(key.split('/')[1].split('_')[0])
        bass = key.startswith('bass/')
        early = cents_off(x, rate, note, 0.01, 0.15 if bass else 0.12)
        late = early if '_short_' in key else cents_off(x, rate, note, 0.15, 0.8)
        return key, early, late

    with ThreadPoolExecutor(max_workers=4) as pool:
        for key, early, late in pool.map(one, todo):
            listing[key]['early'] = early
            listing[key]['late'] = late
    print(f'{len(todo)} notes measured for tuning')


def convert(job, bank):
    src, key, longest = job
    out = f'{bank}/{key}.wav'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fade = min(0.05, longest / 4)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-t', str(longest),
                        '-af', f'aresample={RATE}:resampler=soxr,afade=t=out:st={longest - fade}:d={fade}',
                        '-c:a', 'pcm_s16le', out], capture_output=True, text=True)
    if r.returncode != 0:
        # (an ffmpeg without the soxr resampler: its own is fine too)
        r = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-t', str(longest),
                            '-af', f'aresample={RATE},afade=t=out:st={longest - fade}:d={fade}', '-c:a', 'pcm_s16le', out], capture_output=True, text=True)
    if r.returncode != 0:
        return key, None, r.stderr.strip()[-200:]
    return key, os.path.getsize(out), ''


def main():
    if sys.argv[1] == '--tune':
        bank = sys.argv[2]
        listing = json.load(open(f'{bank}/bank.json'))
        tune(bank, listing)
        with open(f'{bank}/bank.json', 'w') as f:
            json.dump(listing, f, indent=0)
        return
    packs, bank = sys.argv[1:3]
    todo = list(jobs(packs))
    print(len(todo), 'recordings to copy')
    sizes = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        for key, size, err in pool.map(lambda j: convert(j, bank), todo):
            if size is None:
                print('FAILED', key, err)
            else:
                sizes[key] = size
    from scipy.io import wavfile
    import numpy as np
    listing = {}
    for key in sorted(sizes):
        rate, x = wavfile.read(f'{bank}/{key}.wav')
        x = x.astype(np.float64) / 32768
        listing[key] = {'sec': round(len(x) / rate, 3), 'peak': round(float(np.abs(x).max()), 4), 'sides': 1 if x.ndim == 1 else x.shape[1]}
    tune(bank, listing)
    with open(f'{bank}/bank.json', 'w') as f:
        json.dump(listing, f, indent=0)
    total = sum(sizes.values())
    print(f'{len(listing)} recordings in the bank, {total / 1e6:.0f} MB')
    for group in sorted(set(k.rsplit('/', 1)[0] for k in listing)):
        print(f'  {group:28} {sum(1 for k in listing if k.rsplit("/", 1)[0] == group):4}')


if __name__ == '__main__':
    main()
