"""Try-out 2, step 2: the music. Three tunes, each played by the band two ways: exploring (calm and dreamy)
and a fight (heavy, fast), with the fight punching in and falling away.

  python3 tools/sound/lab/tunes.py check          the tunes as written: every note against its chord
  python3 tools/sound/lab/tunes.py [a|b|c ...]    make the clips (into dist/sound/lab/music/)

What he asked for (docs/sound/music_tryout2.md): the band of the sound check with a synth for the air; the
heavy guitars heavier; exploring calmer and dreamier; a tune the guitar never has to hold for long (plucked
with echo while exploring, picked fast in a fight); the fight louder against the exploring than try-out 1's;
the four ways the fight's drums play, all kept.

Everything is a tone lower than the sound check (the lowest string down to C): lower is heavier."""
import sys
import numpy as np
from dsp import SR, save, filt
import gtr
import bass
import fx
import strings
import synth
from drums import Kit, thrash
from mixing import at, wide, centre, lufs
from sounds import BEAT, STEP, BAR, HALL, BOOTH, BRIGHT, master, together, trim

PC = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def n(name):
    """'Eb5' -> 75."""
    letter, rest = name[0], name[1:]
    flat = rest.startswith('b')
    return 12 * (int(rest[1:] if flat else rest) + 1) + NOTE[letter] - (1 if flat else 0)


def chord(name):
    minor = name.endswith('m')
    return PC[name[:-1] if minor else name], minor


def low(name):
    """The heavy guitars' root, on their lowest string (C2 and up)."""
    return 36 + chord(name)[0]


def deep(name):
    """The bass's root (E1 and up)."""
    k = 24 + chord(name)[0]
    return k if k >= 28 else k + 12


def tones(name):
    r, minor = chord(name)
    return [r % 12, (r + (3 if minor else 4)) % 12, (r + 7) % 12]


def power(name):
    r = low(name)
    return [r, r + 7, r + 12]


def shape(name):
    """The whole chord across the six strings, low to high: root, fifth, root, third, fifth, root."""
    r = low(name)
    third = 3 if chord(name)[1] else 4
    return [r, r + 7, r + 12, r + 12 + third, r + 19, r + 24]


def voiced(names):
    """The synth's chords: four voices that each move as little as they can from one chord to the next, over the
    chord's root. names: one for each bar. Returns [(bar, [notes])] with a new entry wherever the chord changes."""
    out = []
    prev = None
    last = None
    for b, name in enumerate(names):
        if name == last:
            continue
        last = name
        pcs = tones(name)
        pool = [k for k in range(55, 80) if k % 12 in pcs]
        if prev is None:
            voices = [min(pool, key=lambda k: abs(k - want)) for want in (60, 64, 67, 72)]
        else:
            voices = [min(pool, key=lambda k: (abs(k - v), k)) for v in prev]
        # every note of the chord must be there, and no two voices on one note
        for _ in range(8):
            have = {v % 12 for v in voices}
            lacking = [p for p in pcs if p not in have]
            twice = [i for i, v in enumerate(voices) if voices.count(v) > 1]
            if not lacking and not twice:
                break
            i = twice[0] if twice else max(range(4), key=lambda j: sum(1 for v in voices if v % 12 == voices[j] % 12))
            want = lacking[0] if lacking else None
            cands = [k for k in pool if k not in voices and (want is None or k % 12 == want)]
            if not cands:
                break
            voices[i] = min(cands, key=lambda k: abs(k - voices[i]))
        voices = sorted(voices)
        prev = voices
        root = 36 + chord(name)[0]
        out.append((b, [root + 12 if root + 12 >= 45 else root + 24] + voices))
    return out


# ---------------------------------------------------------------- the three tunes (sixteen bars each)

def tune(chords, melody):
    names = chords.split()
    assert len(names) == 16, len(names)
    notes = []
    beat = 0.0
    for bar in melody.strip().split('|'):
        used = 0.0
        for item in bar.split():
            name, beats = item.split(':')
            notes.append((beat + used, float(beats), n(name)))
            used += float(beats)
        assert abs(used - 4) < 1e-9, (bar, used)
        beat += 4
    assert beat == 64, beat
    return dict(chords=names, melody=notes)


TUNES = {
    # A: bright and soaring. Long notes that climb.
    'a': dict(name='A', feel='bright and soaring', **tune(
        'C C G G Am Am F F C C G G Am F G C',
        '''G4:2 C5:2 | E5:3 D5:1 | D5:2 B4:2 | G4:4 | A4:2 C5:2 | E5:3 D5:1 | C5:2 A4:2 | A4:2 G4:2 |
           G4:1 C5:1 E5:2 | G5:3 E5:1 | D5:2 G5:2 | D5:4 | C5:2 E5:2 | F5:2 C5:2 | D5:2 B4:2 | C5:4''')),
    # B: bittersweet and heroic. A long-short-long step, in a minor key that keeps lifting.
    'b': dict(name='B', feel='bittersweet and heroic', **tune(
        'Cm Cm Ab Ab Eb Eb Bb Bb Cm Cm Ab Ab Eb Bb Cm Cm',
        '''C5:1.5 D5:0.5 Eb5:2 | G5:3 F5:1 | Eb5:1.5 F5:0.5 Eb5:2 | C5:4 | Bb4:1.5 D5:0.5 Eb5:2 | G5:3 F5:1 | F5:1.5 Eb5:0.5 D5:2 | Bb4:2 D5:2 |
           C5:1.5 D5:0.5 Eb5:2 | G5:3 Ab5:1 | Ab5:2 G5:1 F5:1 | Eb5:4 | G5:2 F5:1 Eb5:1 | D5:2 F5:2 | Eb5:1.5 D5:0.5 C5:2 | C5:4''')),
    # C: flowing, full of wonder. It starts away from home and keeps moving.
    'c': dict(name='C', feel='flowing, full of wonder', **tune(
        'F F C C G G Am Am F F C C G G C C',
        '''A4:1 C5:1 D5:1 C5:1 | A4:2 C5:2 | G4:1 C5:1 E5:1 D5:1 | C5:2 G4:2 | B4:1 D5:1 G5:1 E5:1 | D5:2 B4:2 | C5:1 E5:1 G5:1 A5:1 | E5:4 |
           A4:1 C5:1 F5:1 E5:1 | D5:2 C5:2 | E5:1 G5:1 E5:1 D5:1 | C5:2 E5:2 | D5:1 G5:1 E5:1 D5:1 | B4:2 D5:2 | C5:1 E5:1 G5:1 E5:1 | C5:4''')),
}


def check(key):
    """Every note of the tune against the chord under it: which are the chord's own, and what the others do."""
    t = TUNES[key]
    odd = []
    lo = min(k for _, _, k in t['melody'])
    hi = max(k for _, _, k in t['melody'])
    for i, (beat, beats, k) in enumerate(t['melody']):
        name = t['chords'][int(beat // 4)]
        if k % 12 in tones(name):
            continue
        nxt = t['melody'][i + 1][2] if i + 1 < len(t['melody']) else None
        away = abs(nxt - k) if nxt is not None else 0
        strong = beat % 2 == 0
        # 'rub': a semitone above one of the chord's own notes, the one kind of stranger that grates
        rub = (k - 1) % 12 in tones(name)
        odd.append((int(beat // 4) + 1, beat % 4 + 1, k, name, beats, strong, away, rub))
    print(f"tune {t['name']} ({t['feel']}): {len(t['melody'])} notes from {lo} to {hi}; {len(odd)} are not their chord's own")
    bad = 0
    for bar, beat, k, name, beats, strong, away, rub in odd:
        # a stranger to the chord may pass by, or lean and resolve. A fault is one held long on a strong beat,
        # one that leaps far away, or one that rubs on a strong beat for a beat or more
        fault = (strong and beats > 2) or away > 4 or (rub and strong and beats >= 1)
        bad += fault
        print(f"   bar {bar:2} beat {beat:.1f}: note {k} over {name:3} for {beats} beats, {'strong' if strong else 'weak'} beat, moves on by {away} semitone{'s' if away != 1 else ''}{', rubs' if rub else ''}{'   <-- FAULT' if fault else ''}")
    # the biggest leap, and whether the tune ends on its home note
    leaps = [abs(b[2] - a[2]) for a, b in zip(t['melody'], t['melody'][1:])]
    home = chord(t['chords'][-1])[0]
    print(f"   biggest leap {max(leaps)} semitones; ends on {'its home note' if t['melody'][-1][2] % 12 == home else 'NOT its home note'}; faults {bad}")
    return bad


# ---------------------------------------------------------------- the amps of step 2

# "Heavier": more gain, more thump low down, more bite up top; and four guitars, the second pair darker and thicker
HEAVY = {**gtr.RHYTHM, 'g1': 30, 'g2': 6, 'g3': 3, 'thump_db': 5.5, 'bass_db': 6.5, 'bite_db': 5}
THICK = {**gtr.RHYTHM, 'g1': 30, 'g2': 6, 'g3': 3, 'mid_f': 620, 'mid_db': 10, 'scoop_db': -4, 'bite_f': 3000, 'top': 4600, 'thump_db': 5.5}
# the lead in a fight: every note picked fast, so it wants a bright, tight amp, not a singing one
SHRED = dict(tight=220, mid_f=1100, mid_db=8, g1=36, bias=0.15, g2=7, g3=3.0, bass_db=0, scoop_f=600, scoop_db=-1, treble_db=2,
             thump_db=0, bite_f=2900, bite_db=4, top=5200, top_order=3)
MUTE = 0.05


def wall(strokes, total, old=False):
    """The heavy guitars. As sent in the sound check (old: two, the first amp), or heavier: four."""
    if old:
        left = gtr.amp(gtr.play(strokes, total, -1), gtr.RHYTHM)
        right = gtr.amp(gtr.play(strokes, total, +1), gtr.RHYTHM)
        g = wide(left, right)
    else:
        left = gtr.amp(gtr.play(strokes, total, -1, mute_tau=MUTE), HEAVY)
        right = gtr.amp(gtr.play(strokes, total, +1, mute_tau=MUTE), HEAVY)
        l2 = gtr.amp(gtr.play(strokes, total, -1, seed=31, mute_tau=MUTE), THICK)
        r2 = gtr.amp(gtr.play(strokes, total, +1, seed=31, mute_tau=MUTE), THICK)
        # the second pair sits inside the first, and the other way round (the one that reaches up, on the right)
        inner = np.stack([r2 * 0.775 + l2 * 0.225, r2 * 0.225 + l2 * 0.775], axis=1)
        g = wide(left, right) + inner * 0.7
    return g + fx.reverb(g, BOOTH) * 0.12


# ---------------------------------------------------------------- the fight

def riff(name, way, bar, last=False):
    """One bar of the heavy guitars over a chord, in one of the four ways. Returns strokes with times from the bar's start."""
    p = power(name)
    s = []
    if way == 'gallop':
        for beat in range(4):
            t = beat * BEAT
            if bar % 2 == 1 and beat == 3:
                s.append((t, p, 'ring', 3))
                continue
            s.append((t, p, 'chug', 3))
            s.append((t + 2 * STEP, p, 'chug', 2))
            s.append((t + 3 * STEP, p, 'chug', 2))
    elif way == 'race':
        # every sixteenth, the chord let out on one and three
        for i in range(16):
            s.append((i * STEP, p, 'stab' if i in (0, 8) else 'chug', 3 if i % 4 == 0 else 2))
    elif way == 'halftime':
        # slams: a chord left to ring, two muted strokes, a chord, two more
        s.append((0, p, 'ring', 3))
        s.append((6 * STEP, p, 'chug', 3))
        s.append((7 * STEP, p, 'chug', 2))
        s.append((8 * STEP, p, 'ring', 3))
        s.append((14 * STEP, p, 'chug', 3))
        s.append((15 * STEP, p, 'chug', 2))
    else:
        # blast: root and fifth picked on every sixteenth, a wall
        for i in range(16):
            s.append((i * STEP, p[:2], 'pick', 3 if i % 4 == 0 else 2))
    return s


def fight_parts(t, bars, ways, t0=0.0, total=None):
    """The fight: the heavy guitars' strokes, the bass's notes and the lead's strokes, for `bars` bars from t0."""
    g, b, lead = [], [], []
    for k in range(bars):
        name = t['chords'][k % 16]
        for (dt, notes, how, vel) in riff(name, ways[k], k):
            g.append((t0 + k * BAR + dt, notes, how, vel))
            b.append((t0 + k * BAR + dt, deep(name), 'short' if how in ('chug', 'pick') else 'long', 3))
    # the tune, every note picked fast (a recorded guitar cannot hold a long note as a player does, but this it does well)
    for beat, beats, k in t['melody']:
        if beat < bars * 4:
            lead.append((t0 + beat * BEAT, beats * BEAT, k))
    return g, b, lead


# ---------------------------------------------------------------- exploring

def explore_drums(kit, t0, bar, first):
    """Calmer: a slow beat, half the speed of the fight's. The kick on one, a stick across the rim on three,
    the hi-hat ticking the beats, and little else."""
    for s in range(16):
        t = t0 + s * STEP
        if s == 0:
            kit.hit('kick', t, 0.5)
        if s == 14 and bar % 2 == 1:
            kit.hit('kick', t, 0.36)
        if s == 8:
            kit.hit('sidestick', t, 0.62)
        if s % 4 == 0:
            kit.hit('hat_tight', t, 0.4 if s in (0, 8) else 0.28)
    if first:
        kit.hit('crash2', t0, 0.36, pan=0.3)
    if bar % 4 == 3:
        kit.hit('hat_open', t0 + 14 * STEP, 0.3)


def explore_parts(t, bars, t0=0.0, start=0):
    """Exploring: what the strummed guitar, the picked guitar, the lead and the bass play, for `bars` bars from t0
    (start: which bar of the tune it begins on)."""
    strum, arp, lead, low_notes = [], [], [], []
    for k in range(bars):
        bar = (start + k) % 16
        name = t['chords'][bar]
        sh = shape(name)
        at_ = t0 + k * BAR
        changed = k == 0 or t['chords'][(start + k - 1) % 16] != name
        # the strummed guitar: one slow stroke as each chord arrives, a lighter one up the top strings in between
        if changed:
            strum += strings.damp(at_ - 0.03) if k else []
            strum += strings.strum(at_, sh, True, 2, spread=0.026)
        else:
            strum += strings.strum(at_ + 8 * STEP, sh, False, 1, spread=0.014, strings=(2, 3, 4, 5))
        # the picked guitar: the chord's upper four strings one at a time, a note a beat; its echo fills the gaps
        if changed and k:
            arp += strings.damp(at_ - 0.03)
        for q, i in enumerate((0, 2, 1, 3)):
            arp.append((at_ + q * BEAT, 2 + i, sh[2 + i], 2 if q == 0 else 1))
        # the bass: the root, held; a step up to it now and then
        low_notes.append((at_, deep(name), 'long', 1))
        if not changed and bar % 4 == 3:
            low_notes.append((at_ + 12 * STEP, deep(name) + 7 if deep(name) + 7 <= 43 else deep(name) - 5, 'long', 0))
    # the tune, plucked, an octave below where the fight has it, on two strings turn about, so that each note
    # rings on under the next (one string alone, each note cutting off the last, is taken for a keyboard)
    i = 0
    for beat, beats, k in t['melody']:
        b = beat - start * 4
        if 0 <= b < bars * 4:
            lead.append((t0 + b * BEAT, 4 + i % 2, k - 12, 2))
            i += 1
    return strum, arp, lead, low_notes


ECHO = 3 * STEP          # three sixteenths: the echo falls between the beats


def soft_strum(events, total):
    x = gtr.clean(strings.play(events, total, side=-1, let=3.4), **BRIGHT)
    c = fx.chorus(x, mix=0.3)
    return c + fx.echo(c, ECHO, 0.3) * 0.12 + fx.reverb(c, HALL) * 0.32


def soft_arp(events, total):
    x = gtr.clean(strings.play(events, total, side=1, let=2.8), **BRIGHT)
    c = fx.chorus(x, mix=0.35)
    return c + fx.echo(c, ECHO, 0.5) * 0.42 + fx.reverb(c, HALL) * 0.4


def soft_lead(events, total):
    x = gtr.clean(strings.play(events, total, seed=12, side=-1, let=2.6, loose=0.003), **BRIGHT)
    c = fx.chorus(x, mix=0.3)
    return c + fx.echo(c, ECHO, 0.48) * 0.4 + fx.reverb(c, HALL) * 0.38


def fast_lead(notes, total):
    """The tune in a fight: two guitars, one to each side, every note picked fast, and a third an octave under them."""
    left = gtr.amp(gtr.tremolo(notes, total, -1, seed=5), SHRED)
    right = gtr.amp(gtr.tremolo(notes, total, +1, seed=6), SHRED)
    under = gtr.amp(gtr.tremolo([(a, b, k - 12) for a, b, k in notes], total, -1, seed=9), SHRED)
    g = wide(left, right, cross=0.25) + centre(under) * 0.7
    return g + fx.echo(g, ECHO, 0.3) * 0.16 + fx.reverb(g, HALL) * 0.2


def bass_heavy(notes, total):
    return centre(bass.amp(bass.play(notes, total), dict(grit=4, high=0.38, top=4000)))


def bass_soft(notes, total):
    return centre(bass.amp(bass.play(notes, total, seed=8), dict(grit=1.5, high=0.18)))


# ---------------------------------------------------------------- a clip: exploring, a fight, exploring again

WAYS = ['gallop'] * 4 + ['race'] * 4 + ['halftime'] * 4 + ['blast'] * 2 + ['race'] * 2
PLAN = dict(before=16, fight=16, after=8)       # bars
JUMP = 9.0                                       # how much louder the fight is than the exploring (try-out 1's was 6.3)
TAIL = 4.5
LOUDEST = -13.5                                  # the fight, in LUFS, in the finished clip


def stems(key, plan=PLAN, pad_fight=synth.GLASS, pad_explore=synth.WARM, old_wall=False):
    """Every part of the clip on its own, each the whole clip long: {name: two sides}."""
    t = TUNES[key]
    a, f, z = plan['before'], plan['fight'], plan['after']
    bars = a + f + z
    total = bars * BAR + TAIL
    ta, tf, tz = 0.0, a * BAR, (a + f) * BAR
    out = {}
    # exploring, before and after
    strum, arp, lead, low_notes = explore_parts(t, a, ta)
    s2, a2, l2, b2 = explore_parts(t, z, tz)
    end = tz + z * BAR
    # (the fight's last chord rings over the soft band coming back, and the very end is one last soft chord)
    home = t['chords'][-1]
    s2 += strings.damp(end - 0.03) + strings.strum(end, shape(home), True, 2, spread=0.03)
    a2 += strings.damp(end - 0.03) + [(end, 5, shape(home)[5], 2)]
    b2.append((end, deep(home), 'long', 1))
    out['soft strum'] = soft_strum(strum + s2, total)
    out['soft picked'] = soft_arp(arp + a2, total)
    out['soft lead'] = soft_lead(lead + l2, total)
    out['soft bass'] = bass_soft(low_notes + [(tf, 0, 'stop', 0)] + b2, total)
    kit = Kit(total, seed=4)
    for k in range(a):
        explore_drums(kit, ta + k * BAR, k, first=(k % 8 == 0))
    # the last half-bar before the fight: the snare rolls up into it
    for i in range(8):
        kit.hit('snare', tf - (8 - i) * STEP, 0.3 + 0.085 * i)
    for k in range(z):
        explore_drums(kit, tz + k * BAR, k, first=(k == 0))
    kit.hit('kick', end, 0.5)
    kit.hit('crash2', end, 0.42, pan=0.3)
    d = kit.mix(dict(kick_click=3, kick_box=-4, kick_push=1.0, snare_push=1.0, over=1.1, cymbals=0.6, hats=0.55, kick_tick=9))
    out['soft drums'] = d + fx.reverb(d, BOOTH, hp=300) * 0.25 + fx.reverb(d, HALL) * 0.14
    chords_a = [(ta / BAR + b, notes) for b, notes in voiced(t['chords'][:a])]
    chords_z = [(tz / BAR + b, notes) for b, notes in voiced((t['chords'] * 2)[:z] + [home])]
    out['soft synth'] = synth.pad(synth.lead_in(chords_a, BAR, 1) + synth.lead_in(chords_z, BAR, 2), total, pad_explore)
    # the fight
    g, b, lead_f = fight_parts(t, f, WAYS, tf)
    # its last chord: everyone lands together on the first beat after it, and lets go
    g += [(tz, power(home), 'ring', 3), (tz + 2.6, [], 'stop', 0)]
    b += [(tz, deep(home), 'long', 3), (tz + 2.6, 0, 'stop', 0)]
    wall_ = wall(g, total, old=old_wall)
    # (the last chord dies away under the soft band)
    fade = np.ones(len(wall_))
    i0, i1 = int((tz + 0.4) * SR), int((tz + 2.6) * SR)
    fade[i0:i1] = np.linspace(1, 0, i1 - i0) ** 1.5
    fade[i1:] = 0
    out['heavy guitars'] = wall_ * fade[:, None]
    hb = bass_heavy(b, total)
    out['heavy bass'] = hb * fade[:len(hb), None]
    out['fast lead'] = fast_lead(lead_f, total)
    kit = Kit(total, seed=3)
    for k in range(f):
        thrash(kit, tf + k * BAR, k, WAYS[k], fill=(k % 4 == 3), crash=(k % 2 == 0))
    kit.hit('kick', tz, 1.0)
    kit.hit('crash', tz, 1.0, pan=-0.3)
    kit.hit('china', tz, 0.9)
    d = kit.mix()
    out['heavy drums'] = fx.shave(fx.squeeze(d + fx.reverb(d, BOOTH, hp=300) * 0.18, -16, 3, 0.012, 0.1))
    chords_f = [(tf / BAR + bb, notes) for bb, notes in voiced(t['chords'][:f])]
    out['fight synth'] = synth.pad(synth.lead_in(chords_f, BAR, 1), total, pad_fight)
    return out, dict(total=total, fight=(tf, tz), bars=bars)


# how loud each part is set before the two groups are set against each other (LUFS, of the part's own stretch)
SOFT = {'soft strum': -24, 'soft picked': -23, 'soft lead': -22, 'soft bass': -24.5, 'soft drums': -24, 'soft synth': -24}
LOUD = {'heavy guitars': -18, 'heavy bass': -20, 'heavy drums': -15, 'fast lead': -21, 'fight synth': -24}


def section(x, a, b):
    return x[int(a * SR):int(b * SR)]


def mix(parts, info, jump=JUMP):
    """The parts set against each other, the fight `jump` LU louder than the exploring, and the whole made as loud
    as the fight can cleanly be."""
    tf, tz = info['fight']
    n_ = min(len(p) for p in parts.values())
    soft = sum(at(parts[k], v)[:n_] for k, v in SOFT.items())
    loud = sum(at(parts[k], v)[:n_] for k, v in LOUD.items())
    quiet = lufs(section(soft, 0, tf))
    full = lufs(section(loud, tf, tz))
    soft = soft * 10 ** ((full - jump - quiet) / 20)
    # the soft band steps back while the fight is on: its drums and bass stop (they are written to), and the rest
    # (the guitars' ring, the synth) fades under the wall and comes back as it ends
    duck = np.ones(n_)
    i0, i1 = int(tf * SR), int(tz * SR)
    k = int(0.35 * SR)
    duck[i0:i0 + k] = np.linspace(1, 0, k)
    duck[i0 + k:i1] = 0
    return soft * duck[:, None] + loud


PARTS = 'v2'      # change this when anything that makes the parts changes, and they are made again


def kept(key, **kw):
    """The parts of a tune's clip, made once and kept on disk (they take minutes to make)."""
    import os
    from where import OUT
    path = OUT + f'music/parts_{key}_{PARTS}.npz'
    if not kw and os.path.exists(path):
        z = np.load(path, allow_pickle=True)
        return {k: z[k].astype(np.float64) for k in z.files if k != 'info'}, z['info'].item()
    parts, info = stems(key, **kw)
    if not kw:
        os.makedirs(OUT + 'music', exist_ok=True)
        np.savez(path, info=np.array(info, dtype=object), **{k: v.astype(np.float32) for k, v in parts.items()})
    return parts, info


def clip(key, **kw):
    parts, info = kept(key, **kw)
    x = mix(parts, info)
    tf, tz = info['fight']
    # as loud as the fight can cleanly be
    full = lufs(section(x, tf, tz))
    x = x * 10 ** ((LOUDEST - full) / 20)
    y = master(x)
    info['limiter'] = 20 * np.log10(np.abs(x).max() / np.abs(y).max())
    return trim(y, floor=-55), parts, info


if __name__ == '__main__':
    import os
    from where import OUT
    args = sys.argv[1:] or ['a', 'b', 'c']
    if args[0] == 'check':
        sys.exit(1 if sum(check(k) for k in TUNES) else 0)
    os.makedirs(OUT + 'music', exist_ok=True)
    for key in args:
        y, parts, info = clip(key)
        tf, tz = info['fight']
        save(OUT + f'music/tune_{key}.wav', y)
        q, f_ = lufs(section(y, 0, tf)), lufs(section(y, tf, tz))
        print(f"tune {TUNES[key]['name']} ({TUNES[key]['feel']}): {len(y) / SR:.1f} s; exploring {q:.1f} LUFS, the fight {f_:.1f} LUFS, {f_ - q:.1f} louder; peak {20 * np.log10(np.abs(y).max()):.1f} dB; the limiter took off {info['limiter']:.1f} dB at most", flush=True)
