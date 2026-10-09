"""The lab's drummer: the real kit's recordings, played hit by hit, each through its close microphone
and the pair overhead, then mixed as a rock record's drums are (cut, boosted, squeezed a little)."""
import numpy as np
from dsp import SR, load, put, filt, fresh, LISTING

BEAT = 0.35
STEP = BEAT / 4


def layers(group):
    ks = [k for k in LISTING if k.startswith(f'drums/{group}/')]
    top = max(int(k.rsplit('/', 1)[1].split('_')[0]) for k in ks)
    takes = max(int(k.rsplit('_', 1)[1]) for k in ks)
    return top, takes


class Kit:
    """Tracks for each part of the kit, so each can be treated its own way before they are mixed."""

    def __init__(self, length, seed=3):
        n = int(length * SR)
        self.t = {name: np.zeros(n) for name in ('kick', 'snare', 'under', 'toms')}
        self.t.update({name: np.zeros((n, 2)) for name in ('over', 'hats', 'cymbals', 'smack')})
        self.rng = np.random.default_rng(seed)
        self.turn = {}

    def _pick(self, group, vel):
        top, takes = layers(group)
        # which loudness layer: the hit's strength, never quite the same twice
        f = np.clip(vel + self.rng.normal(0, 0.035), 0.02, 1) * top
        layer = int(np.clip(np.ceil(f), 1, top))
        return layer, fresh(self.rng, self.turn, group, takes)

    def hit(self, drum, t, vel=1.0, pan=0.0, rate=1.0):
        """drum: kick, snare, rimshot, sidestick, hat_tight, hat_shut, hat_half, hat_open, hat_foot, ride, ride_bell, crash, crash2, china, tom1..tom4"""
        t = max(0.0, t + self.rng.normal(0, 0.0025))
        close = {'kick': 'close', 'snare': 'top', 'rimshot': 'top', 'sidestick': 'top'}.get(drum, 'close')
        layer, take = self._pick(f'{drum}/{close}', vel)
        key = f'{layer}_{take}'
        c = load(f'drums/{drum}/{close}/{key}')
        o = load(f'drums/{drum}/over/{key}')
        if drum == 'kick':
            put(self.t['kick'], c, t)
            # the kick's close microphone hears only its thump; the smack of the beater is in the pair overhead,
            # so the kick's overhead sound is kept apart as well, to be turned up on its own
            put(self.t['smack'], o * np.exp(-np.arange(len(o)) / (0.07 * SR))[:, None], t)
        elif drum in ('snare', 'rimshot', 'sidestick'):
            put(self.t['snare'], c, t)
            if drum != 'sidestick':
                put(self.t['under'], load(f'drums/{drum}/under/{key}'), t)
        elif drum.startswith('tom'):
            put(self.t['toms'], c, t)
        elif drum.startswith('hat'):
            put(self.t['hats'], np.stack([c * (1 - pan) / 2 * 2 * 0.5, c * (1 + pan) / 2 * 2 * 0.5], axis=1) if c.ndim == 1 else c, t)
        else:
            cc = c if c.ndim == 2 else np.stack([c, c], axis=1)
            put(self.t['cymbals'], cc * np.array([1 - max(0, pan), 1 + min(0, pan)]), t)
        put(self.t['over'], o, t)

    def mix(self, p=None):
        p = {**MIX, **(p or {})}
        k = self.t['kick']
        k = filt(k, 'highpass', 38, -3)
        k = filt(k, 'peaking', 65, 1.2, p['kick_low'])
        k = filt(k, 'peaking', 330, 1.0, p['kick_box'])
        k = filt(k, 'peaking', p['kick_click_f'], 1.4, p['kick_click'])
        k = np.tanh(k * p['kick_push']) / np.tanh(p['kick_push'])
        if p['kick_tick']:
            # the beater's tick on the skin: it is in the close microphone's sound, but far down under the thump
            k = filt(k, 'highshelf', p['kick_tick_f'], gain=p['kick_tick'])
        s = self.t['snare']
        s = filt(s, 'highpass', 110, -3)
        s = filt(s, 'peaking', 210, 1.2, p['snare_body'])
        s = filt(s, 'peaking', 5200, 1.0, p['snare_crack'])
        u = filt(self.t['under'], 'highpass', 400, -3) * p['under']
        sn = np.tanh((s + u) * p['snare_push']) / np.tanh(p['snare_push'])
        tm = filt(filt(self.t['toms'], 'highpass', 60, -3), 'peaking', 400, 1.0, -4)
        tm = filt(tm, 'peaking', 4000, 1.0, 4)
        ov = filt(self.t['over'], 'highpass', p['over_hp'], -3)
        ov = filt(ov, 'highshelf', 6000, gain=p['over_air'])
        # the kick's smack: what the overhead pair heard of it, with the thump taken out (a phone's speaker cannot
        # play the thump, so without this the kick is all but gone on a phone)
        sm = filt(filt(self.t['smack'], 'highpass', p['smack_hp'], -3), 'highpass', p['smack_hp'], -3)
        sm = filt(sm, 'peaking', 2500, 0.8, p['smack_bite'])
        mono = lambda x, g: np.stack([x * g, x * g], axis=1)
        out = mono(k, p['kick']) + mono(sn, p['snare']) + mono(tm, p['toms']) + ov * p['over'] + self.t['hats'] * p['hats'] + self.t['cymbals'] * p['cymbals']
        return out + sm * p['smack']


MIX = dict(kick=1.0, kick_low=3, kick_box=-7, kick_click_f=3800, kick_click=9, kick_push=1.6,
           snare=1.15, snare_body=3, snare_crack=4, snare_push=1.5, under=0.45,
           toms=1.0, over=1.2, over_hp=180, over_air=3, hats=0.65, cymbals=0.7,
           smack=0.0, smack_hp=350, smack_bite=4, kick_tick=18.0, kick_tick_f=2000)

GALLOP = [True, False, True, True]


def thrash(kit, t0, bar, drive, fill=False, crash=True):
    """One bar of the thrash half, one of its four ways (as try-out 1 had them, which he liked)."""
    for s in range(16):
        t = t0 + s * STEP
        on = s % 4 == 0
        if fill and s >= 8:
            if s < 12:
                kit.hit('snare', t, 0.72 + 0.07 * (s - 8))
            else:
                kit.hit('tom2' if s < 14 else 'tom4', t, 0.9)
            if on:
                kit.hit('kick', t, 0.95)
            continue
        if drive == 'gallop':
            if GALLOP[s % 4]:
                kit.hit('kick', t, 1.0 if on else 0.82)
        elif drive == 'blast':
            if s % 2 == 0:
                kit.hit('kick', t, 0.93)
        else:
            kit.hit('kick', t, 1.0 if on else 0.84)
        if drive == 'halftime':
            if s == 8:
                kit.hit('rimshot', t, 1.0)
        elif drive == 'blast':
            if s % 2 == 1:
                kit.hit('snare', t, 0.8)
        elif s in (4, 12):
            kit.hit('rimshot', t, 1.0)
        if drive == 'gallop':
            if s % 2 == 0:
                kit.hit('hat_shut', t, 0.9 if on else 0.6)
        elif drive == 'halftime':
            if on:
                kit.hit('china' if s in (0, 8) else 'ride_bell', t, 0.85)
        elif s % 2 == 0:
            kit.hit('ride', t, 0.9 if on else 0.6)
    if crash:
        kit.hit('crash' if bar % 4 == 0 else 'crash2', t0, 1.0 if bar % 8 == 0 else 0.8, pan=-0.3 if bar % 4 == 0 else 0.3)


def soft(kit, t0, bar):
    """One bar of the band holding back: a light, brisk beat. The hi-hat ticks on every eighth, the kick is on
    one and three (with a push into three), and a soft snare answers on two and four."""
    for s in range(16):
        t = t0 + s * STEP
        if s in (0, 8) or (s == 6 and bar % 2 == 1):
            kit.hit('kick', t, 0.55 if s != 6 else 0.42)
        if s in (4, 12):
            kit.hit('snare', t, 0.5)
        if s % 2 == 0:
            kit.hit('hat_tight', t, 0.5 if s % 4 == 0 else 0.34)
    if bar % 4 == 0:
        kit.hit('crash2', t0, 0.4, pan=0.3)
    if bar % 4 == 3:
        kit.hit('hat_open', t0 + 14 * STEP, 0.45)
