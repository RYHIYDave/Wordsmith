// Synthesized retro sound effects (Web Audio API). There are no sound files: every effect is a
// short recipe of oscillators and filtered noise bursts with volume and pitch envelopes.
//
// Signal path:
//   recipe layers -> one gain per play (opts.vol) -> compressor -> master gain -> speakers
// The compressor works as a limiter: a single sound passes through untouched, but when many
// overlap it squeezes the mix so the output cannot clip. The master gain is the volume / mute
// control.
//
// Browsers only allow sound after the player has clicked, tapped or pressed a key, so initAudio()
// should be called from such an event. If it is called earlier, the player's next click or key
// press starts the audio. Until audio runs (or where it does not exist at all) sfx() quietly does
// nothing. Nothing in this file ever throws.
//
// TO ADD OR CHANGE A SOUND: edit its recipe in RECIPES (and add the name to the Sfx type). Sounds
// cannot be auditioned in the headless preview, so try them in the running game.

export type Sfx =
  | 'swing' | 'hit' | 'crit' | 'shot' | 'orb' | 'nova' | 'slam' | 'trapSet' | 'trapBoom' | 'fire' | 'frost' | 'zap'
  | 'explode' | 'hurt' | 'death' | 'monsterDie' | 'bossRoar' | 'pickup' | 'gold' | 'word' | 'rare' | 'levelUp'
  | 'potion' | 'portal' | 'click' | 'equip' | 'deny' | 'dodge' | 'imbue' | 'buy' | 'power'
  | 'gust' | 'echo' | 'leech' | 'rune' | 'shatter' | 'thunder' | 'might'
  | 'wave' | 'orbSet' | 'beam' | 'beamHum' | 'whirl' | 'familiar' | 'familiarShot'
  | 'volley' | 'arrowLand'
  | 'door' | 'gateFall' | 'gateRise';

/** Master volume until setVolume is called. */
const DEFAULT_VOLUME = 0.35;
/** At most this many sounds play at once; further requests are dropped. */
const MAX_VOICES = 16;
/** The same sound is not restarted within this many milliseconds. */
const MIN_REPEAT_MS = 40;
/** Each play is randomly tuned up or down by up to this fraction, so repeats do not sound robotic. */
const PITCH_SPREAD = 0.04;
/**
 * The recipes below are written so that one loud sound peaks at about 1. This scales every play
 * down so a single sound sits just under the compressor's threshold and keeps its natural
 * loudness; only overlapping sounds get squeezed.
 */
const VOICE_GAIN = 0.5;
/**
 * Applied after the compressor. A pile-up of sounds can push the compressor's output to about 1.0
 * (the loudest a speaker signal can be), so even volume 1 keeps 15% in hand and never clips.
 */
const HEADROOM = 0.85;
/** Envelopes fade to this level (inaudible) rather than to 0, which an exponential fade cannot reach. */
const SILENT = 0.001;

let ctx: AudioContext | null = null;
/** Every play plugs into the compressor. */
let bus: DynamicsCompressorNode | null = null;
let master: GainNode | null = null;
/** One second of white noise shared by every noise burst. */
let noiseBuf: AudioBuffer | null = null;

let muted = false;
let volume = DEFAULT_VOLUME;

/** Audio-clock times at which the currently playing sounds end. */
const voiceEnds: number[] = [];
/** When each sound was last started (performance.now() milliseconds). */
const lastPlayed = new Map<string, number>();

/**
 * Sounds asked for while the context was still starting up. Some browsers need a moment after the
 * player's first click before audio runs; without this the very first sound would be lost.
 * Only a few recent requests are kept, so a context that wakes late cannot blurt out a backlog.
 */
interface Pending {
  name: Sfx;
  opts: { vol?: number; pitch?: number } | undefined;
  ms: number;
}
const pending: Pending[] = [];
const PENDING_MAX = 4;
/** A pending request older than this (milliseconds) is forgotten instead of played late. */
const PENDING_MS = 400;

let initFailures = 0;
let gesturesHooked = false;
const reported = new Set<string>();

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
}

/** Mention a failure once in the console (useful while developing) and carry on. */
function report(what: string, err: unknown): void {
  if (reported.has(what)) return;
  reported.add(what);
  try {
    console.warn(`audio: ${what} failed`, err);
  } catch {
    // no console: nothing more to do
  }
}

/** Ask a sleeping audio context to start. Browsers only honour this during a click or key press. */
function wake(): void {
  try {
    const c = ctx;
    if (c && c.state !== 'running' && c.state !== 'closed') {
      const p: Promise<void> | undefined = c.resume();
      if (p && typeof p.then === 'function') p.then(flushPending, () => undefined);
    }
  } catch {
    // stays asleep; the next gesture tries again
  }
}

/** Play what was requested just before the context started running. */
function flushPending(): void {
  if (pending.length === 0 || !ctx || ctx.state !== 'running') return;
  const waiting = pending.splice(0, pending.length);
  const ms = nowMs();
  for (const p of waiting) {
    if (ms - p.ms <= PENDING_MS) sfx(p.name, p.opts);
  }
}

function applyVolume(): void {
  try {
    if (ctx && master) master.gain.setTargetAtTime(muted ? 0 : volume * HEADROOM, ctx.currentTime, 0.01);
  } catch {
    // ignore
  }
}

/** Create or resume the AudioContext. Call from a user gesture; safe to call repeatedly. */
export function initAudio(): void {
  try {
    if (typeof window === 'undefined') return;
    if (!ctx) {
      if (initFailures >= 3) return;
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      initFailures++; // counted as failed until everything below has worked
      const c = new Ctor();

      const comp = c.createDynamicsCompressor();
      // Set up as a limiter: quiet and single sounds pass untouched, a pile-up of sounds is held
      // just below full scale. (Measured: 16 loud sounds at once peak at 0.8-0.86 at volume 1.)
      comp.threshold.value = -8; // dB: louder than this gets squeezed
      comp.knee.value = 6;
      comp.ratio.value = 20;
      comp.attack.value = 0.001;
      comp.release.value = 0.1;
      const m = c.createGain();
      m.gain.value = muted ? 0 : volume * HEADROOM;
      comp.connect(m);
      m.connect(c.destination);

      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      ctx = c;
      bus = comp;
      master = m;
      noiseBuf = buf;
      initFailures = 0;
      if (typeof c.addEventListener === 'function') c.addEventListener('statechange', flushPending);

      // If the context was created outside a gesture, or the browser pauses it later (a phone
      // call, a background tab), the player's next click or key press starts it again.
      if (!gesturesHooked && typeof window.addEventListener === 'function') {
        gesturesHooked = true;
        for (const type of ['pointerdown', 'mousedown', 'touchend', 'keydown']) {
          window.addEventListener(type, wake, { capture: true, passive: true });
        }
      }
    }
    wake();
  } catch (err) {
    report('initAudio', err);
  }
}

export function setMuted(m: boolean): void {
  muted = !!m;
  applyVolume();
}

export function isMuted(): boolean {
  return muted;
}

/** Master volume 0..1, default 0.35. */
export function setVolume(v: number): void {
  if (typeof v === 'number' && !Number.isNaN(v)) volume = Math.max(0, Math.min(1, v));
  applyVolume();
}

// ---------------------------------------------------------------------------------------------
// Building blocks. A recipe is a few "layers"; each layer is one oscillator or one burst of
// filtered noise with its own loudness shape.

/** One play of one sound: where its layers plug in, when it starts and how it is tuned. */
interface Voice {
  c: AudioContext;
  out: GainNode;
  noise: AudioBuffer;
  /** Start time on the audio clock (seconds). */
  t: number;
  /** Frequency multiplier for this play: opts.pitch times the random variation. */
  pitch: number;
  /** Audio-clock time at which the last layer has finished, and the source that finishes then. */
  end: number;
  last: AudioScheduledSourceNode | null;
}

/** How loud a layer is over time. All times are in seconds. */
interface Shape {
  /** Delay after the start of the sound (default 0). */
  at?: number;
  /** Total length, including the fade-out. */
  dur: number;
  /** Peak volume. Tones are loud at 0.3; noise through a narrow filter needs 1 or more. */
  vol: number;
  /** Fade-in time (default 0.002: an instant, slightly clicky start). */
  attack?: number;
  /** Time held at full volume before the fade-out starts (default 0: fade straight away). */
  hold?: number;
  /** Tremolo [rate in Hz, depth 0..1]: a fast volume wobble, for growls and shimmer. */
  trem?: readonly [number, number];
  /** Vibrato [rate in Hz, depth in cents]: a pitch wobble (on noise it wobbles the filter). */
  vib?: readonly [number, number];
}

/** Keep a frequency inside what every browser accepts. */
function hz(f: number): number {
  return Math.max(16, Math.min(18000, f));
}

/** A slow helper oscillator that wobbles a parameter by +-depth between t and end. */
function wobble(c: AudioContext, target: AudioParam, rate: number, depth: number, t: number, end: number): void {
  const o = c.createOscillator();
  o.frequency.value = rate;
  const g = c.createGain();
  g.gain.value = depth;
  o.connect(g);
  g.connect(target);
  o.start(t);
  o.stop(end + 0.03);
}

/** Plug a source into the voice through its loudness shape. Returns the layer's start time. */
function shaped(v: Voice, source: AudioScheduledSourceNode, tail: AudioNode, s: Shape): number {
  const c = v.c;
  const t = v.t + (s.at ?? 0);
  const end = t + s.dur;
  const attack = Math.min(s.attack ?? 0.002, s.dur * 0.5);
  const hold = Math.max(0, Math.min(s.hold ?? 0, s.dur - attack - 0.01));

  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(s.vol, t + attack);
  if (hold > 0) env.gain.setValueAtTime(s.vol, t + attack + hold);
  env.gain.exponentialRampToValueAtTime(SILENT, end);

  if (s.trem) {
    // volume swings between (1 - depth) and 1
    const half = Math.max(0, Math.min(1, s.trem[1])) / 2;
    const tg = c.createGain();
    tg.gain.value = 1 - half;
    wobble(c, tg.gain, s.trem[0], half, t, end);
    tail.connect(tg);
    tg.connect(env);
  } else {
    tail.connect(env);
  }
  env.connect(v.out);

  if (end >= v.end) {
    v.end = end;
    v.last = source;
  }
  return t;
}

/** An oscillator that glides from one pitch to another (Hz) over the layer's length. */
function tone(v: Voice, type: OscillatorType, from: number, to: number, s: Shape): void {
  const o = v.c.createOscillator();
  o.type = type;
  const t = shaped(v, o, o, s);
  o.frequency.setValueAtTime(hz(from * v.pitch), t);
  if (to !== from) o.frequency.exponentialRampToValueAtTime(hz(to * v.pitch), t + s.dur);
  if (s.vib) wobble(v.c, o.detune, s.vib[0], s.vib[1], t, t + s.dur);
  o.start(t);
  o.stop(t + s.dur + 0.02);
}

/**
 * A burst of white noise through a filter whose frequency sweeps from one value to another (Hz).
 * 'lowpass' = dull rumble, 'highpass' = hiss and clicks, 'bandpass' = wind and whooshes
 * (q sets how narrow, and so how "whistly", the band is).
 */
function noise(v: Voice, kind: BiquadFilterType, from: number, to: number, s: Shape, q = 1): void {
  const src = v.c.createBufferSource();
  src.buffer = v.noise;
  src.loop = true;
  const filter = v.c.createBiquadFilter();
  filter.type = kind;
  filter.Q.value = q;
  src.connect(filter);
  const t = shaped(v, src, filter, s);
  filter.frequency.setValueAtTime(hz(from * v.pitch), t);
  if (to !== from) filter.frequency.exponentialRampToValueAtTime(hz(to * v.pitch), t + s.dur);
  if (s.vib) wobble(v.c, filter.detune, s.vib[0], s.vib[1], t, t + s.dur);
  src.start(t, Math.random() * 0.9); // a different slice of the noise each time
  src.stop(t + s.dur + 0.02);
}

/** A run of steady notes `step` seconds apart, each with the same shape. */
function notes(v: Voice, type: OscillatorType, freqs: readonly number[], step: number, s: Shape): void {
  const at = s.at ?? 0;
  for (let i = 0; i < freqs.length; i++) tone(v, type, freqs[i], freqs[i], { ...s, at: at + i * step });
}

// ---------------------------------------------------------------------------------------------
// The sounds. Frequencies are in Hz, times in seconds.

const RECIPES: Record<Sfx, (v: Voice) => void> = {
  // ---- attacks -------------------------------------------------------------------------------
  /** Short noise whoosh, rising. */
  swing: (v) => {
    noise(v, 'bandpass', 500, 2800, { dur: 0.15, vol: 1.4, attack: 0.045 }, 1.2);
  },
  /** Thud plus click. */
  hit: (v) => {
    tone(v, 'sine', 180, 55, { dur: 0.13, vol: 0.3 });
    tone(v, 'triangle', 420, 140, { dur: 0.07, vol: 0.5 });
    noise(v, 'bandpass', 1400, 500, { dur: 0.08, vol: 2 }, 0.9);
    noise(v, 'highpass', 3500, 3500, { dur: 0.02, vol: 0.3 });
  },
  /** A brighter, higher hit with a ringing edge. */
  crit: (v) => {
    tone(v, 'sine', 240, 70, { dur: 0.14, vol: 0.3 });
    tone(v, 'triangle', 520, 170, { dur: 0.08, vol: 0.25 });
    tone(v, 'square', 880, 440, { dur: 0.1, vol: 0.18 });
    tone(v, 'triangle', 1760, 1320, { dur: 0.2, vol: 0.32 });
    noise(v, 'highpass', 3000, 6000, { dur: 0.08, vol: 0.45 });
  },
  /** Bow twang: the string snaps back and wobbles, the arrow hisses away. */
  shot: (v) => {
    tone(v, 'triangle', 520, 190, { dur: 0.16, vol: 0.5 });
    tone(v, 'sawtooth', 260, 110, { dur: 0.1, vol: 0.15, vib: [38, 80] });
    noise(v, 'bandpass', 2500, 5000, { dur: 0.1, vol: 0.6, attack: 0.015 }, 2);
  },
  /** A volley leaves the bow for the sky: the string four times over, close together, and the arrows hissing up and away. */
  volley: (v) => {
    for (let k = 0; k < 4; k++) {
      tone(v, 'triangle', 540 + k * 35, 200, { at: k * 0.045, dur: 0.13, vol: 0.34 });
      noise(v, 'bandpass', 2400, 5200, { at: k * 0.045, dur: 0.09, vol: 0.4, attack: 0.012 }, 2);
    }
    noise(v, 'bandpass', 900, 3600, { at: 0.08, dur: 0.38, vol: 0.5, attack: 0.1 }, 1.2);
  },
  /** One arrow of a volley comes down and sticks in the floor: a short hiss and a dull knock. */
  arrowLand: (v) => {
    noise(v, 'bandpass', 4200, 1800, { dur: 0.05, vol: 0.5, attack: 0.005 }, 2);
    noise(v, 'lowpass', 500, 220, { at: 0.035, dur: 0.07, vol: 0.9, attack: 0.004 }, 1);
    tone(v, 'triangle', 210, 120, { at: 0.035, dur: 0.06, vol: 0.2 });
  },
  /** Soft magic "pew". */
  orb: (v) => {
    tone(v, 'sine', 980, 340, { dur: 0.2, vol: 0.3, attack: 0.008 });
    tone(v, 'triangle', 1470, 510, { dur: 0.14, vol: 0.1, attack: 0.008 });
  },
  /** A wave leaves the staff: a swish of air with a low hum under it, falling away. */
  wave: (v) => {
    noise(v, 'bandpass', 700, 2600, { dur: 0.26, vol: 1.1, attack: 0.03 }, 1.1);
    tone(v, 'sine', 300, 170, { dur: 0.24, vol: 0.22, attack: 0.02 });
    tone(v, 'triangle', 600, 340, { dur: 0.18, vol: 0.08, attack: 0.02 });
  },
  /** The staff comes down on the floor, and an orb hums into being. */
  orbSet: (v) => {
    tone(v, 'sine', 150, 55, { dur: 0.16, vol: 0.5 });
    noise(v, 'lowpass', 900, 200, { dur: 0.1, vol: 1.2 });
    tone(v, 'triangle', 330, 495, { at: 0.05, dur: 0.3, vol: 0.14, attack: 0.05 });
    tone(v, 'sine', 660, 990, { at: 0.07, dur: 0.26, vol: 0.08, attack: 0.06 });
  },
  /** A beam that is being held: a short steady note with air in it, played at every bite so that they run together. */
  beamHum: (v) => {
    tone(v, 'sine', 990, 940, { dur: 0.26, vol: 0.1, attack: 0.03, hold: 0.14, trem: [34, 0.35] });
    tone(v, 'sawtooth', 495, 470, { dur: 0.24, vol: 0.035, attack: 0.03, hold: 0.12 });
    noise(v, 'bandpass', 3600, 3000, { dur: 0.24, vol: 0.16, attack: 0.04, hold: 0.1 }, 4);
  },
  /** One turn of a whirlwind: the blade goes round, a rush of air that rises and falls away. */
  whirl: (v) => {
    noise(v, 'bandpass', 500, 2200, { dur: 0.15, vol: 1.2, attack: 0.03 }, 1.4);
    noise(v, 'bandpass', 2200, 700, { at: 0.12, dur: 0.16, vol: 0.9, attack: 0.02 }, 1.4);
    tone(v, 'triangle', 190, 120, { dur: 0.22, vol: 0.12, attack: 0.03 });
  },
  /** A beam leaves the wand: a bright, hard line of sound that is there all at once. (beamHum carries it on.) */
  beam: (v) => {
    tone(v, 'sawtooth', 1320, 660, { dur: 0.2, vol: 0.2, attack: 0.004 });
    tone(v, 'sine', 1980, 990, { dur: 0.18, vol: 0.26, attack: 0.004 });
    tone(v, 'sine', 110, 55, { dur: 0.16, vol: 0.3 });
    noise(v, 'bandpass', 4200, 2200, { dur: 0.16, vol: 0.5, attack: 0.006 }, 3);
  },
  /** A familiar is called: two small notes, the second higher. */
  familiar: (v) => {
    tone(v, 'triangle', 660, 680, { dur: 0.1, vol: 0.2, attack: 0.01 });
    tone(v, 'triangle', 990, 1010, { at: 0.09, dur: 0.16, vol: 0.2, attack: 0.01 });
    tone(v, 'sine', 1980, 2020, { at: 0.09, dur: 0.14, vol: 0.06 });
  },
  /** A familiar's bolt: a pip. */
  familiarShot: (v) => {
    tone(v, 'sine', 1500, 820, { dur: 0.07, vol: 0.14, attack: 0.004 });
  },
  /** Airy burst spreading outwards. */
  nova: (v) => {
    noise(v, 'bandpass', 300, 3600, { dur: 0.4, vol: 1.75, attack: 0.03, hold: 0.08 }, 0.8);
    noise(v, 'highpass', 5000, 8000, { at: 0.04, dur: 0.34, vol: 0.16, attack: 0.08 });
    tone(v, 'sine', 220, 660, { dur: 0.3, vol: 0.22, attack: 0.02 });
  },
  /** The weight of the Power word: a deep thump with a crack of stone on top. */
  power: (v) => {
    tone(v, 'sine', 120, 30, { dur: 0.42, vol: 0.6 });
    tone(v, 'triangle', 64, 32, { dur: 0.3, vol: 0.3 });
    noise(v, 'lowpass', 1000, 70, { dur: 0.26, vol: 2.0 });
    noise(v, 'highpass', 2600, 1400, { dur: 0.04, vol: 0.45 });
    noise(v, 'bandpass', 1700, 500, { at: 0.045, dur: 0.12, vol: 0.9 }, 1.2);
  },
  /** Swift: a quick breath of wind, rising. */
  gust: (v) => {
    noise(v, 'bandpass', 500, 3200, { dur: 0.2, vol: 1.3, attack: 0.03 }, 1.2);
    noise(v, 'highpass', 6000, 9000, { at: 0.02, dur: 0.14, vol: 0.12, attack: 0.04 });
  },
  /** Twin: the same note twice, the second fainter. */
  echo: (v) => {
    tone(v, 'triangle', 880, 860, { dur: 0.12, vol: 0.2 });
    tone(v, 'triangle', 880, 860, { at: 0.11, dur: 0.14, vol: 0.11 });
    tone(v, 'sine', 1760, 1740, { at: 0.11, dur: 0.1, vol: 0.05 });
  },
  /** Leech: a soft, wet swallow. */
  leech: (v) => {
    tone(v, 'sine', 420, 190, { dur: 0.22, vol: 0.3, attack: 0.02, trem: [18, 0.5] });
    noise(v, 'lowpass', 900, 300, { dur: 0.16, vol: 0.8, attack: 0.03 });
    tone(v, 'sine', 620, 640, { at: 0.14, dur: 0.12, vol: 0.1 });
  },
  /** Volatile behind: a rune being written, humming upward. */
  rune: (v) => {
    tone(v, 'sawtooth', 110, 330, { dur: 0.5, vol: 0.16, attack: 0.08, vib: [9, 60] });
    tone(v, 'sine', 220, 660, { dur: 0.5, vol: 0.14, attack: 0.1 });
    noise(v, 'bandpass', 1800, 4200, { dur: 0.45, vol: 0.5, attack: 0.2 }, 6);
  },
  // ---- doors and gates (game/doors.ts) ---------------------------------------------------------
  /** An iron door swinging open: the creak of its hinges, and the latch. */
  door: (v) => {
    tone(v, 'sawtooth', 380, 620, { dur: 0.28, vol: 0.09, attack: 0.04, vib: [45, 23] });
    tone(v, 'triangle', 190, 300, { dur: 0.26, vol: 0.1, attack: 0.05, vib: [30, 19] });
    noise(v, 'highpass', 4200, 2600, { at: 0.0, dur: 0.03, vol: 0.25 });
    tone(v, 'square', 1500, 1100, { at: 0.27, dur: 0.04, vol: 0.06 });
  },
  /** The boss's gate coming down: the rattle of its run, then iron on stone. */
  gateFall: (v) => {
    for (let i = 0; i < 6; i++) noise(v, 'highpass', 3200 - i * 200, 2000, { at: i * 0.03, dur: 0.025, vol: 0.35 });
    noise(v, 'lowpass', 900, 90, { at: 0.2, dur: 0.4, vol: 1.5 });
    tone(v, 'sine', 110, 38, { at: 0.2, dur: 0.4, vol: 0.55 });
    tone(v, 'square', 620, 540, { at: 0.2, dur: 0.22, vol: 0.08, vib: [14, 40] });
    tone(v, 'triangle', 1240, 1180, { at: 0.21, dur: 0.3, vol: 0.06 });
  },
  /** A gate going up: its chain, link by link. */
  gateRise: (v) => {
    for (let i = 0; i < 12; i++) {
      noise(v, 'highpass', 2600 + (i % 3) * 300, 1800, { at: i * 0.085, dur: 0.03, vol: 0.28 });
      tone(v, 'square', 300 + (i % 2) * 40, 260, { at: i * 0.085, dur: 0.04, vol: 0.05 });
    }
    tone(v, 'triangle', 120, 180, { dur: 1.0, vol: 0.12, attack: 0.2 });
  },
  /** Ice breaking. */
  shatter: (v) => {
    noise(v, 'highpass', 5200, 3000, { dur: 0.09, vol: 0.5 });
    for (let i = 0; i < 5; i++) tone(v, 'sine', 2400 + Math.random() * 3200, 1800 + Math.random() * 800, { at: 0.01 + i * 0.022, dur: 0.07, vol: 0.09 });
    noise(v, 'bandpass', 3000, 1200, { at: 0.03, dur: 0.16, vol: 0.8 }, 2);
  },
  /** A bolt from above: the crack, then the rumble. */
  thunder: (v) => {
    noise(v, 'highpass', 3000, 1200, { dur: 0.05, vol: 0.7 });
    tone(v, 'sawtooth', 900, 90, { dur: 0.1, vol: 0.2, vib: [60, 600] });
    noise(v, 'lowpass', 500, 60, { at: 0.03, dur: 0.5, vol: 1.6, attack: 0.02 });
    tone(v, 'sine', 70, 34, { at: 0.03, dur: 0.45, vol: 0.4 });
  },
  /** Power behind: strength gathering, one step per use. */
  might: (v) => {
    tone(v, 'square', 196, 294, { dur: 0.14, vol: 0.14 });
    tone(v, 'sine', 98, 147, { dur: 0.2, vol: 0.4 });
    noise(v, 'lowpass', 700, 200, { dur: 0.1, vol: 0.9 });
  },
  /** Low boom. */
  slam: (v) => {
    tone(v, 'sine', 140, 32, { dur: 0.45, vol: 0.55 });
    tone(v, 'triangle', 80, 36, { dur: 0.3, vol: 0.25 });
    tone(v, 'square', 180, 50, { dur: 0.18, vol: 0.15 });
    noise(v, 'lowpass', 1400, 80, { dur: 0.32, vol: 2.2 });
  },
  /** Metallic click-clack of a trap being armed. */
  trapSet: (v) => {
    noise(v, 'highpass', 4500, 4500, { dur: 0.015, vol: 0.45 });
    tone(v, 'square', 2100, 2000, { dur: 0.04, vol: 0.22 });
    tone(v, 'square', 3170, 3050, { dur: 0.035, vol: 0.15 });
    noise(v, 'bandpass', 2600, 2600, { at: 0.07, dur: 0.025, vol: 2 }, 4);
    tone(v, 'square', 1400, 1300, { at: 0.07, dur: 0.05, vol: 0.18 });
  },
  /** A spring snaps, then a boom with a falling pitch. */
  trapBoom: (v) => {
    tone(v, 'square', 1600, 500, { dur: 0.05, vol: 0.12 });
    noise(v, 'lowpass', 2600, 140, { dur: 0.4, vol: 1.0 });
    tone(v, 'sine', 210, 42, { dur: 0.36, vol: 0.4 });
  },
  /** Crackle over a whoosh. */
  fire: (v) => {
    noise(v, 'bandpass', 350, 1500, { dur: 0.36, vol: 1.4, attack: 0.07, hold: 0.06 }, 0.9);
    for (let i = 0; i < 6; i++) {
      noise(v, 'highpass', 2600, 2600, { at: 0.03 + Math.random() * 0.26, dur: 0.015, vol: 0.15 + Math.random() * 0.2 });
    }
  },
  /** Glassy high chime. */
  frost: (v) => {
    noise(v, 'highpass', 7000, 7000, { dur: 0.03, vol: 0.15 });
    tone(v, 'sine', 2093, 2093, { dur: 0.42, vol: 0.2 });
    tone(v, 'sine', 3136, 3120, { dur: 0.34, vol: 0.11 });
    tone(v, 'triangle', 5274, 5250, { at: 0.03, dur: 0.24, vol: 0.06 });
  },
  /** Buzzy electric zap. */
  zap: (v) => {
    tone(v, 'sawtooth', 1300, 160, { dur: 0.17, vol: 0.28, vib: [72, 700] });
    tone(v, 'square', 2100, 300, { dur: 0.12, vol: 0.14, vib: [53, 500] });
    noise(v, 'bandpass', 4000, 1500, { dur: 0.14, vol: 1.1 }, 3);
  },
  /** The biggest boom: a blast of noise, a falling rumble and some debris. */
  explode: (v) => {
    noise(v, 'lowpass', 4000, 90, { dur: 0.58, vol: 1.1 });
    tone(v, 'sine', 150, 28, { dur: 0.55, vol: 0.5 });
    tone(v, 'sawtooth', 95, 34, { dur: 0.35, vol: 0.15 });
    noise(v, 'bandpass', 1400, 300, { at: 0.04, dur: 0.3, vol: 0.8 }, 0.7);
  },

  // ---- hero and monsters -----------------------------------------------------------------------
  /** Low grunt: a square wave dropping in pitch. */
  hurt: (v) => {
    tone(v, 'square', 330, 120, { dur: 0.2, vol: 0.4 });
    tone(v, 'sawtooth', 247, 90, { dur: 0.2, vol: 0.26 });
    noise(v, 'lowpass', 1200, 300, { dur: 0.09, vol: 1.6 });
  },
  /** Long descending tone. */
  death: (v) => {
    tone(v, 'square', 440, 52, { dur: 0.6, vol: 0.26, hold: 0.3, vib: [7, 35] });
    tone(v, 'sawtooth', 330, 39, { dur: 0.6, vol: 0.1, hold: 0.3 });
    tone(v, 'triangle', 220, 40, { dur: 0.6, vol: 0.36, hold: 0.3 });
  },
  /** Short crunch. */
  monsterDie: (v) => {
    noise(v, 'bandpass', 1500, 350, { dur: 0.14, vol: 2.2 }, 1.5);
    tone(v, 'square', 200, 55, { dur: 0.12, vol: 0.2 });
    noise(v, 'highpass', 3200, 3200, { at: 0.035, dur: 0.02, vol: 0.3 });
    noise(v, 'highpass', 2400, 2400, { at: 0.07, dur: 0.02, vol: 0.22 });
  },
  /** Low growl. */
  bossRoar: (v) => {
    tone(v, 'sawtooth', 92, 50, { dur: 0.6, vol: 0.3, attack: 0.05, hold: 0.3, trem: [27, 0.6] });
    tone(v, 'sawtooth', 184, 100, { dur: 0.6, vol: 0.19, attack: 0.05, hold: 0.3, trem: [27, 0.6] });
    tone(v, 'square', 61, 38, { dur: 0.6, vol: 0.1, attack: 0.05, hold: 0.3, trem: [31, 0.5] });
    noise(v, 'lowpass', 1100, 300, { dur: 0.55, vol: 2.0, attack: 0.06, hold: 0.25, trem: [27, 0.5] });
  },

  // ---- loot and progress -----------------------------------------------------------------------
  /** Soft rising blip. */
  pickup: (v) => {
    tone(v, 'sine', 620, 930, { dur: 0.09, vol: 0.33, attack: 0.006 });
  },
  /** Two bright coin pings, the second a fifth higher. */
  gold: (v) => {
    tone(v, 'square', 1319, 1319, { dur: 0.07, vol: 0.085 });
    tone(v, 'triangle', 1319, 1319, { dur: 0.07, vol: 0.125 });
    tone(v, 'square', 1976, 1976, { at: 0.07, dur: 0.26, vol: 0.085 });
    tone(v, 'triangle', 1976, 1976, { at: 0.07, dur: 0.26, vol: 0.125 });
  },
  /** Mysterious rising arpeggio (an augmented chord: Bb D F# Bb D) for a power word. */
  word: (v) => {
    const chord = [233.08, 293.66, 369.99, 466.16, 587.33];
    notes(v, 'triangle', chord, 0.085, { dur: 0.26, vol: 0.4, attack: 0.012, vib: [6, 30] });
    notes(v, 'sine', chord.map((f) => f * 2), 0.085, { at: 0.02, dur: 0.22, vol: 0.12, attack: 0.02 });
  },
  /** Bright three-note chime. */
  rare: (v) => {
    const chord = [1318.5, 1661.2, 1975.5];
    notes(v, 'sine', chord, 0.075, { dur: 0.32, vol: 0.22 });
    notes(v, 'triangle', chord.map((f) => f * 2), 0.075, { dur: 0.16, vol: 0.06 });
  },
  /** Triumphant rising arpeggio (C major) ending on a held chord. */
  levelUp: (v) => {
    const chord = [523.25, 659.25, 783.99];
    notes(v, 'square', chord, 0.08, { dur: 0.1, vol: 0.1, hold: 0.05 });
    notes(v, 'triangle', chord, 0.08, { dur: 0.1, vol: 0.17, hold: 0.05 });
    tone(v, 'square', 1046.5, 1046.5, { at: 0.24, dur: 0.36, vol: 0.1, hold: 0.12 });
    tone(v, 'triangle', 1046.5, 1046.5, { at: 0.24, dur: 0.36, vol: 0.17, hold: 0.12 });
    tone(v, 'triangle', 783.99, 783.99, { at: 0.24, dur: 0.36, vol: 0.1, hold: 0.12 });
  },
  /** Gulp: three quick bubbles. */
  potion: (v) => {
    tone(v, 'sine', 280, 620, { dur: 0.08, vol: 0.55, attack: 0.008 });
    tone(v, 'sine', 240, 560, { at: 0.1, dur: 0.08, vol: 0.55, attack: 0.008 });
    tone(v, 'sine', 340, 860, { at: 0.2, dur: 0.1, vol: 0.55, attack: 0.008 });
  },
  /** Shimmering upward sweep. */
  portal: (v) => {
    tone(v, 'sine', 200, 1300, { dur: 0.6, vol: 0.25, attack: 0.1, hold: 0.25, trem: [16, 0.6] });
    tone(v, 'triangle', 302, 1950, { dur: 0.6, vol: 0.1, attack: 0.15, hold: 0.2, trem: [21, 0.6] });
    noise(v, 'bandpass', 900, 6000, { dur: 0.6, vol: 0.9, attack: 0.2, hold: 0.15 }, 4);
  },

  // ---- interface -------------------------------------------------------------------------------
  /** Tiny tick. */
  click: (v) => {
    noise(v, 'highpass', 3000, 3000, { dur: 0.012, vol: 0.25 });
    tone(v, 'square', 1250, 900, { dur: 0.05, vol: 0.2 });
  },
  /** Cloth rustle, then a buckle clinks. */
  equip: (v) => {
    noise(v, 'bandpass', 900, 500, { dur: 0.12, vol: 1.1, attack: 0.03 }, 0.8);
    noise(v, 'highpass', 5000, 5000, { at: 0.07, dur: 0.012, vol: 0.15 });
    tone(v, 'triangle', 2450, 2400, { at: 0.07, dur: 0.14, vol: 0.12 });
    tone(v, 'square', 3620, 3560, { at: 0.07, dur: 0.07, vol: 0.035 });
  },
  /** Low double buzz: "no". */
  deny: (v) => {
    tone(v, 'square', 150, 150, { dur: 0.09, vol: 0.25, hold: 0.06 });
    tone(v, 'sawtooth', 75, 75, { dur: 0.09, vol: 0.26, hold: 0.06 });
    tone(v, 'square', 120, 120, { at: 0.12, dur: 0.14, vol: 0.25, hold: 0.1 });
    tone(v, 'sawtooth', 60, 60, { at: 0.12, dur: 0.14, vol: 0.26, hold: 0.1 });
  },
  /** Quick whoosh, falling (the swing rises). */
  dodge: (v) => {
    noise(v, 'bandpass', 1900, 450, { dur: 0.22, vol: 0.8, attack: 0.05 }, 1);
  },
  /** Anvil ting, then a shimmer as the word sinks into the metal. */
  imbue: (v) => {
    noise(v, 'highpass', 5000, 5000, { dur: 0.015, vol: 0.3 });
    tone(v, 'triangle', 1568, 1560, { dur: 0.5, vol: 0.24 });
    tone(v, 'sine', 2637, 2630, { dur: 0.4, vol: 0.12 });
    tone(v, 'sine', 4310, 4300, { dur: 0.25, vol: 0.06 });
    tone(v, 'sine', 3136, 4186, { at: 0.1, dur: 0.45, vol: 0.08, attack: 0.1, hold: 0.1, trem: [22, 0.8] });
  },
  /** Coins clinking onto a counter. */
  buy: (v) => {
    noise(v, 'highpass', 6000, 6000, { dur: 0.012, vol: 0.25 });
    tone(v, 'triangle', 2217, 2217, { dur: 0.08, vol: 0.24 });
    tone(v, 'triangle', 2960, 2960, { at: 0.04, dur: 0.1, vol: 0.24 });
    tone(v, 'triangle', 2637, 2637, { at: 0.09, dur: 0.2, vol: 0.24 });
    tone(v, 'square', 1480, 1480, { at: 0.09, dur: 0.05, vol: 0.05 });
  },
};

// ---------------------------------------------------------------------------------------------

/** Start one play of one recipe: the part of sfx() that a spoken line shares. */
function start(c: AudioContext, into: AudioNode, noiseData: AudioBuffer, key: string, ms: number, vol: number, asked: number | undefined, recipe: (v: Voice) => void): void {
  const last = lastPlayed.get(key);
  if (last !== undefined && ms - last >= 0 && ms - last < MIN_REPEAT_MS) return;

  // forget the sounds that have finished, then refuse if too many are still playing
  const t = c.currentTime;
  let live = 0;
  for (let i = 0; i < voiceEnds.length; i++) {
    if (voiceEnds[i] > t) voiceEnds[live++] = voiceEnds[i];
  }
  voiceEnds.length = live;
  if (live >= MAX_VOICES) return;
  lastPlayed.set(key, ms);

  const out = c.createGain();
  out.gain.value = Math.min(vol, 4) * VOICE_GAIN;
  out.connect(into);
  const pitch = asked !== undefined && asked > 0 ? Math.max(0.25, Math.min(4, asked)) : 1;
  const v: Voice = {
    c,
    out,
    noise: noiseData,
    t,
    pitch: pitch * (1 + (Math.random() * 2 - 1) * PITCH_SPREAD),
    end: t,
    last: null,
  };
  recipe(v);
  voiceEnds.push(v.end);

  // unplug this play's nodes once its last layer has finished
  if (v.last) {
    v.last.onended = () => {
      try {
        out.disconnect();
      } catch {
        // already gone
      }
    };
  }
}

/**
 * Play a sound. Does nothing before initAudio, when muted, or where Web Audio is missing. Never throws.
 * opts.vol multiplies the loudness (default 1), opts.pitch multiplies the frequency (default 1).
 */
export function sfx(name: Sfx, opts?: { vol?: number; pitch?: number }): void {
  try {
    const c = ctx;
    if (!c || !bus || !noiseBuf || muted || c.state === 'closed') return;
    // own-property check: a stray name such as 'toString' must not find an inherited function
    const recipe = Object.prototype.hasOwnProperty.call(RECIPES, name) ? RECIPES[name] : undefined;
    if (typeof recipe !== 'function') return;
    const vol = opts?.vol ?? 1;
    if (!(vol > 0)) return;

    const ms = nowMs();
    if (c.state !== 'running') {
      // Scheduling on a sleeping context would pile sounds up and blurt them all out when it
      // wakes. Instead remember only the latest few; flushPending plays them if it wakes soon.
      let slot = -1;
      for (let i = 0; i < pending.length; i++) {
        if (pending[i].name === name) slot = i;
      }
      if (slot >= 0) pending.splice(slot, 1);
      if (pending.length >= PENDING_MAX) pending.shift();
      pending.push({ name, opts, ms });
      return;
    }

    start(c, bus, noiseBuf, name, ms, vol, opts?.pitch, recipe);
  } catch (err) {
    report(`sfx '${name}'`, err);
  }
}

// ---------------------------------------------------------------------------------------------
// Voices
//
// There is no recorded speech. When a hero says a line, it is heard as a mumble in that hero's
// voice: one short note per syllable, in the rhythm of the words, falling at the end of a
// statement and rising at the end of a question. The owner: "give the three characters a
// different voice", "the warrior very deep and gruff", "the ranger stoic and laconic, like a
// hunter in woods that doesnt want to spook anything around him", "give the mage a british
// accent", "give me male and female voices".
//   warrior  deep and gruff: a low rough buzz with a growl in it and gravel under it, unhurried
//   ranger   hushed: mostly breath, a little tone, even and flat, nothing raised
//   mage     plummy: long smooth beats that run into one another, and a tune that swoops
// Each comes lower (male) and higher (female), in the same manner. A mumble has no words to have
// an accent in: the mage's Britishness is in the mage's own lines (QUIPS.cls), and this is only
// its manner.

export type Speaker = 'warrior' | 'ranger' | 'mage';
export type SpeakerVoice = 'male' | 'female';

interface VoiceKind {
  /** The voice's own pitch in Hz, and the waveform that gives it its grain. */
  pitch: number;
  wave: OscillatorType;
  /** A second, quieter note this many times higher, for colour (0 = none). */
  over: number;
  overWave: OscillatorType;
  /** Seconds a syllable sounds for, and seconds from one syllable to the next. */
  syllable: number;
  step: number;
  vol: number;
  /** How far the pitch wanders from syllable to syllable (a fraction of the pitch). */
  lilt: number;
  trem?: readonly [number, number];
  vib?: readonly [number, number];
  /** Breath on every beat: [loudness, the hiss's pitch in Hz, how narrow]. A whisper is nearly all breath. */
  breath?: readonly [number, number, number];
  /** Gravel under every beat: [loudness, the rumble's top in Hz]. */
  grit?: readonly [number, number];
}

const VOICES: Record<Speaker, Record<SpeakerVoice, VoiceKind>> = {
  warrior: {
    male: { pitch: 68, wave: 'sawtooth', over: 2, overWave: 'triangle', syllable: 0.15, step: 0.175, vol: 0.26, lilt: 0.04, trem: [29, 0.6], grit: [0.7, 240] },
    female: { pitch: 132, wave: 'sawtooth', over: 2, overWave: 'triangle', syllable: 0.14, step: 0.168, vol: 0.22, lilt: 0.05, trem: [33, 0.55], grit: [0.55, 400] },
  },
  ranger: {
    male: { pitch: 122, wave: 'triangle', over: 0, overWave: 'sine', syllable: 0.09, step: 0.14, vol: 0.09, lilt: 0.025, breath: [1.1, 1500, 1.3] },
    female: { pitch: 198, wave: 'triangle', over: 0, overWave: 'sine', syllable: 0.09, step: 0.14, vol: 0.09, lilt: 0.025, breath: [1.1, 2200, 1.3] },
  },
  mage: {
    male: { pitch: 154, wave: 'sine', over: 2, overWave: 'triangle', syllable: 0.15, step: 0.128, vol: 0.32, lilt: 0.2, vib: [6, 30] },
    female: { pitch: 296, wave: 'sine', over: 2, overWave: 'triangle', syllable: 0.15, step: 0.128, vol: 0.3, lilt: 0.2, vib: [6, 30] },
  },
};

/** How many beats a word takes to say: its groups of vowels, less the ones English leaves silent. A rule of thumb, good enough for a rhythm. */
export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  let n = (w.match(/[aeiouy]+/g) ?? []).length;
  // a silent e at the end ("there"), but not "-le" after a consonant ("double")
  if (/[^aeiouy]e$/.test(w) && !/[^aeiouy]le$/.test(w)) n--;
  // "-ed" is silent after anything but t or d ("crushed", but "predicted")
  if (/[^aeiouytd]ed$/.test(w)) n--;
  // "-ing" after a vowel is a beat of its own ("seeing")
  if (/[aeiouy]ing$/.test(w)) n++;
  return Math.max(1, n);
}

/**
 * The notes of a line: for each syllable, when it starts (in steps of the voice) and how far its
 * pitch is from the voice's own (a multiplier), with the bend it ends on. Plain data, so the
 * rhythm can be tested without a speaker.
 */
export function speechPlan(text: string): { at: number; pitch: number; bend: number }[] {
  const out: { at: number; pitch: number; bend: number }[] = [];
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  let at = 0;
  words.forEach((word, wi) => {
    const n = syllables(word);
    for (let i = 0; i < n; i++) {
      // the same letters always give the same tune; the first beat of a word is stressed
      const code = word.charCodeAt(Math.min(word.length - 1, i * 2)) + i * 7 + wi * 3;
      const wander = ((code % 5) - 2) / 2; // -1 .. 1
      out.push({ at, pitch: wander + (i === 0 ? 0.5 : 0), bend: 0 });
      at += 1;
    }
    if (n === 0) return;
    // a breath between words; a longer one at a comma or a full stop inside the line
    const pause = /[,.!?;:]$/.test(word) && wi < words.length - 1 ? 1.3 : 0.35;
    at += pause;
  });
  if (out.length) {
    // the last beat carries the meaning: up for a question, a jump for a shout, down for a statement
    const end = text.trim().slice(-1);
    out[out.length - 1].bend = end === '?' ? 0.3 : end === '!' ? 0.12 : -0.22;
    if (end === '?') out[out.length - 1].pitch += 1;
  }
  return out;
}

/** Say a line in a hero's voice. Does nothing before initAudio, when muted, or where Web Audio is missing. Never throws. */
export function speak(who: Speaker, voice: SpeakerVoice, text: string, vol = 1): void {
  try {
    const c = ctx;
    if (!c || !bus || !noiseBuf || muted || c.state !== 'running' || !(vol > 0)) return;
    const kinds = Object.prototype.hasOwnProperty.call(VOICES, who) ? VOICES[who] : undefined;
    const k = kinds ? (voice === 'female' ? kinds.female : kinds.male) : undefined;
    if (!k) return;
    const plan = speechPlan(text).slice(0, 14);
    if (!plan.length) return;
    start(c, bus, noiseBuf, `voice:${who}`, nowMs(), vol, undefined, (v) => {
      for (const p of plan) {
        const f = k.pitch * (1 + p.pitch * k.lilt);
        const to = f * (1 + p.bend);
        const shape: Shape = { at: 0.06 + p.at * k.step, dur: p.bend !== 0 ? k.syllable * 1.5 : k.syllable, vol: k.vol, attack: 0.012, hold: k.syllable * 0.35, trem: k.trem, vib: k.vib };
        tone(v, k.wave, f, to, shape);
        if (k.over > 0) tone(v, k.overWave, f * k.over, to * k.over, { ...shape, vol: k.vol * 0.3 });
        // (the noise layers are tuned in Hz, not to the voice: undo the play's own tuning for them)
        if (k.breath) noise(v, 'bandpass', k.breath[1] / v.pitch, (k.breath[1] * (1 + p.bend * 0.5)) / v.pitch, { ...shape, vol: k.breath[0], attack: 0.02, trem: undefined, vib: undefined }, k.breath[2]);
        if (k.grit) noise(v, 'lowpass', k.grit[1] / v.pitch, (k.grit[1] * 0.8) / v.pitch, { ...shape, vol: k.grit[0], trem: k.trem, vib: undefined });
      }
    });
  } catch (err) {
    report(`speak '${who}'`, err);
  }
}
