// The Dream Thrash try-out: the first music written for Wordsmith. NOT IN THE GAME.
// Nothing imports this file, so it is not in Play.html. It goes in only through the main chat, and
// only after the owner has heard it and said yes (docs/sound/RULEBOOK.md, "Music").
//
// Like every sound in the game it is made in code: oscillators, noise and filters (Web Audio), with
// no sound files. The music has two halves that share one tune and one beat:
//   - the DREAM half never stops: a wash of chords, a slow soaring lead, a sparkle, a soft low note;
//   - the THRASH half punches in for a fight: racing drums, a fast picked riff, a wall of chords.
// `playSong` writes a stretch of it onto any audio clock, a live one or one that renders to a file
// (tools/sound/render_music.mjs makes the samples the owner listens to from this very code).

/** One beat, in seconds: 171.43 beats a minute. A sixteenth is 0.0875 s and a bar is 1.4 s. */
export const BEAT = 0.35;
export const STEP = BEAT / 4;
export const BAR = BEAT * 4;
/** The tune is 32 bars long and then comes round again (44.8 s). */
export const LOOP_BARS = 32;

export type Part = 'pad' | 'lead' | 'sparkle' | 'low' | 'drums' | 'bass' | 'chug' | 'riff';
export const DREAM: Part[] = ['pad', 'lead', 'sparkle', 'low'];
export const THRASH: Part[] = ['drums', 'bass', 'chug', 'riff'];

export interface Plan {
  /** How many bars to play. */
  bars: number;
  /** The bar of the tune to begin on (0 to 31). */
  from?: number;
  /** The fights: each is [the beat it starts on, the beat it ends on], counted from the start. */
  fights?: Array<[number, number]>;
  /** Play only these parts (to hear one alone, or to measure it). */
  only?: Part[];
  /** Leave the limiter off the end (for measuring). */
  raw?: boolean;
  /** Other loudnesses for the parts than `LEVELS` (for tuning). */
  levels?: Partial<Record<Part, number>>;
  /** How loud each drum is against its usual self: 0 leaves it out (to measure one drum alone). */
  kit?: Partial<Record<Drum, number>>;
  /** How much room and echo: 1 is the usual, 0 is none (to measure how wet the sound is). */
  wet?: number;
  /** What plays the thrash half's chords, riff and bass: plucked strings through an amp (the usual), or held saw waves (a plain synth). */
  wall?: 'strings' | 'saws';
}

export type Drum = 'kick' | 'snare' | 'hat' | 'ride' | 'crash' | 'tom';

/** How loud each part is, set by measuring each one alone (tools/sound/measure.py). */
export const LEVELS: Record<Part, number> = {
  pad: 0.408, lead: 0.1, sparkle: 0.145, low: 0.03, drums: 0.221, bass: 0.098, chug: 0.0654, riff: 0.0341,
};

// ---------------------------------------------------------------------------------------------
// The score
// ---------------------------------------------------------------------------------------------

const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** A note's number on a keyboard: "A4" is 69, "F#5" is 78. */
export function note(name: string): number {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  if (!m) throw new Error('not a note: ' + name);
  return 12 * (Number(m[3]) + 1) + SEMITONE[m[1]] + (m[2] ? 1 : 0);
}

const hz = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

/** The key is D major. The chords: G, D, A (first with its fourth hanging, "Asus") and B minor. */
export type ChordName = 'G' | 'D' | 'Asus' | 'A' | 'Bm';

/** The chord of each bar. Bars 0 to 15 are the first strain, 16 to 31 the lift. */
export const CHORD_OF_BAR: ChordName[] = [
  'G', 'G', 'D', 'D', 'Asus', 'A', 'Bm', 'Bm',
  'G', 'G', 'D', 'D', 'Asus', 'A', 'Bm', 'Bm',
  'G', 'G', 'A', 'A', 'Bm', 'Bm', 'D', 'D',
  'G', 'G', 'A', 'A', 'Bm', 'Bm', 'A', 'A',
];

interface Chord {
  /** The low note the bass and the wall of chords stand on. */
  root: number;
  /** The four notes of the wash. The top one is the same A in every chord: it floats. */
  pad: number[];
  /** The five notes the sparkle picks from, low to high. */
  glint: number[];
}

const chord = (root: string, pad: string[], glint: string[]): Chord => ({ root: note(root), pad: pad.map(note), glint: glint.map(note) });

export const CHORDS: Record<ChordName, Chord> = {
  G: chord('G2', ['B3', 'D4', 'G4', 'A4'], ['D5', 'G5', 'A5', 'B5', 'D6']),
  D: chord('D2', ['A3', 'D4', 'F#4', 'A4'], ['D5', 'E5', 'F#5', 'A5', 'D6']),
  Asus: chord('A2', ['A3', 'D4', 'E4', 'A4'], ['D5', 'E5', 'A5', 'B5', 'E6']),
  A: chord('A2', ['A3', 'C#4', 'E4', 'A4'], ['C#5', 'E5', 'A5', 'B5', 'E6']),
  Bm: chord('B2', ['B3', 'D4', 'F#4', 'A4'], ['D5', 'F#5', 'A5', 'B5', 'D6']),
};

/**
 * The lead, a bar to a line: "note:beats", "-" for a rest, "~" to carry the last note over the
 * bar line. It moves slowly and sits high, like a voice over the rush underneath.
 */
export const LEAD: string[] = [
  'D5:1 A5:3', 'B5:2 A5:1 G5:1', 'F#5:3 E5:1', 'D5:2 E5:1 F#5:1',
  'E5:1 B5:3', 'C#6:2 B5:1 A5:1', 'F#5:2 D5:2', 'E5:3 -:1',
  'D5:1 A5:3', 'B5:2 D6:2', '~D6:1 C#6:1 A5:2', 'F#5:2 E5:1 F#5:1',
  'E5:1 B5:3', 'C#6:3 B5:1', 'A5:3 F#5:1', 'E5:2 F#5:1 A5:1',
  'B5:3 A5:1', 'G5:2 A5:1 B5:1', 'C#6:3 B5:1', 'A5:2 B5:1 C#6:1',
  'D6:4', '~D6:2 C#6:1 B5:1', 'A5:4', 'F#5:2 A5:2',
  'B5:3 A5:1', 'G5:2 A5:1 B5:1', 'C#6:3 B5:1', 'A5:2 B5:1 C#6:1',
  'D6:4', '~D6:2 B5:2', 'C#6:3 B5:1', 'A5:3 -:1',
];

/** A second voice under the lead, a sixth or a fifth below, the last eight bars only. */
export const HARMONY: string[] = [
  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  'D5:4', 'B4:2 D5:2', 'E5:4', 'C#5:2 D5:1 E5:1',
  'F#5:4', '~F#5:2 D5:2', 'E5:4', 'C#5:3 -:1',
];

/** The picked riff: two voices, sixteen strokes a bar, shared out evenly over the notes given. */
export const RIFF_HIGH: string[][] = [
  ['B4', 'D5'], ['B4', 'A4'], ['A4', 'D5'], ['A4', 'F#4'], ['D5', 'E5'], ['C#5', 'E5'], ['D5', 'F#5'], ['D5', 'B4'],
  ['B4', 'D5'], ['B4', 'A4'], ['A4', 'D5'], ['A4', 'F#4'], ['D5', 'E5'], ['C#5', 'E5'], ['D5', 'F#5'], ['D5', 'B4'],
  ['B4', 'D5', 'G5', 'D5'], ['B4', 'D5', 'G5', 'A5'], ['C#5', 'E5', 'A5', 'E5'], ['C#5', 'E5', 'A5', 'B5'],
  ['D5', 'F#5', 'B5', 'F#5'], ['D5', 'F#5', 'B5', 'A5'], ['D5', 'F#5', 'A5', 'F#5'], ['D5', 'F#5', 'A5', 'D5'],
  ['B4', 'D5', 'G5', 'D5'], ['B4', 'D5', 'G5', 'A5'], ['C#5', 'E5', 'A5', 'E5'], ['C#5', 'E5', 'A5', 'B5'],
  ['D5', 'F#5', 'B5', 'F#5'], ['D5', 'F#5', 'B5', 'A5'], ['C#5', 'E5', 'A5', 'E5'], ['C#5', 'E5', 'A5', 'E5'],
];
export const RIFF_LOW: string[][] = [
  ['G4', 'B4'], ['G4', 'D4'], ['F#4', 'A4'], ['F#4', 'D4'], ['A4', 'A4'], ['A4', 'C#5'], ['B4', 'D5'], ['B4', 'F#4'],
  ['G4', 'B4'], ['G4', 'D4'], ['F#4', 'A4'], ['F#4', 'D4'], ['A4', 'A4'], ['A4', 'C#5'], ['B4', 'D5'], ['B4', 'F#4'],
  ['G4', 'B4', 'D5', 'B4'], ['G4', 'B4', 'D5', 'F#5'], ['A4', 'C#5', 'E5', 'C#5'], ['A4', 'C#5', 'E5', 'E5'],
  ['B4', 'D5', 'F#5', 'D5'], ['B4', 'D5', 'F#5', 'F#5'], ['A4', 'D5', 'F#5', 'D5'], ['A4', 'D5', 'F#5', 'A4'],
  ['G4', 'B4', 'D5', 'B4'], ['G4', 'B4', 'D5', 'F#5'], ['A4', 'C#5', 'E5', 'C#5'], ['A4', 'C#5', 'E5', 'E5'],
  ['B4', 'D5', 'F#5', 'D5'], ['B4', 'D5', 'F#5', 'F#5'], ['A4', 'C#5', 'E5', 'C#5'], ['A4', 'C#5', 'E5', 'C#5'],
];

/** One note of a voice: where it starts and how long it lasts (in beats from bar 0), and its number. */
export interface Tone { at: number; len: number; n: number; }

/** Reads a voice written a bar to a line into its notes. */
export function voice(lines: string[]): Tone[] {
  const tones: Tone[] = [];
  lines.forEach((line, bar) => {
    let at = bar * 4;
    for (const word of line.split(' ').filter((w) => w)) {
      const [name, beats] = word.split(':');
      const len = Number(beats);
      if (name === '-') { /* a rest */ }
      else if (name[0] === '~') {
        const last = tones[tones.length - 1];
        if (!last || last.n !== note(name.slice(1)) || Math.abs(last.at + last.len - at) > 1e-9) throw new Error('nothing to carry over in bar ' + bar);
        last.len += len;
      } else tones.push({ at, len, n: note(name) });
      at += len;
    }
    if (line && Math.abs(at - (bar + 1) * 4) > 1e-9) throw new Error('bar ' + bar + ' is not four beats long');
  });
  return tones;
}

/** How much of the lead's bright edge is heard outside a fight (in a fight, all of it). */
const EDGE_IN_DREAM = 0.2;

/** How much quieter or louder the saw-wave wall is made, so that it sits where the strings do. */
const SAW_TRIM = { chug: 1.97, riff: 2.37, bass: 2.21 };

/** The four kinds of eight bars the thrash half goes through, in order. */
export type Drive = 'gallop' | 'race' | 'halftime' | 'blast';
export const DRIVE_OF_EIGHT: Drive[] = ['gallop', 'race', 'halftime', 'blast'];

/** The strokes of a gallop: a long and two shorts to every beat. */
const GALLOP = [true, false, true, true];

// ---------------------------------------------------------------------------------------------
// Making the sound
// ---------------------------------------------------------------------------------------------

/** A small random-number maker that gives the same numbers every time (so a sample can be made again). */
function dice(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The room the dream half rings in: a long tail of noise that dies away and darkens as it dies. */
function room(ctx: BaseAudioContext, seconds: number, rt60: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(seconds * sr);
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    const rnd = dice(1009 + ch * 7919);
    const pre = Math.floor(0.012 * sr);
    let low = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      const fall = Math.pow(10, (-3 * t) / rt60);
      const cut = 1400 + 7600 * Math.exp(-t / 0.45);
      low += (1 - Math.exp((-2 * Math.PI * cut) / sr)) * (rnd() * 2 - 1 - low);
      d[i] = low * fall * Math.min(1, 0.25 + t / 0.006);
    }
  }
  return buf;
}

/** A curve that squashes a wave's peaks: the grit of the thrash half. */
function grit(amount: number) {
  const n = 2049;
  const curve = new Float32Array(n);
  const top = Math.tanh(amount);
  for (let i = 0; i < n; i++) curve[i] = Math.tanh(amount * ((i / (n - 1)) * 2 - 1)) / top;
  return curve;
}

/**
 * A plucked string, worked out sample by sample (Karplus and Strong's way: a short burst of noise
 * goes round and round a loop one wavelength long, a little duller and quieter each time round).
 * `ring` is how many seconds it takes to die away; `soft` (0 to 1) is how dull it is.
 */
function pluck(ctx: BaseAudioContext, freq: number, seconds: number, ring: number, soft: number, seed: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const n = Math.floor(seconds * sr);
  const buf = ctx.createBuffer(1, n, sr);
  const out = buf.getChannelData(0);
  const blend = 0.08 + 0.42 * soft;
  const delay = sr / freq - blend;
  const size = Math.ceil(delay) + 4;
  const line = new Float32Array(size);
  const rnd = dice(seed);
  // the pick: the loop starts full of noise with its highs taken off twice over, as a plucked
  // string's are (most of a string's strength is in its lowest few overtones)
  const ease = 1 - Math.exp((-2 * Math.PI * freq * (6 - 4 * soft)) / sr);
  let [one, two, mean] = [0, 0, 0];
  for (let i = -size; i < size; i++) {
    one += ease * (rnd() * 2 - 1 - one);
    two += ease * (one - two);
    if (i >= 0) {
      line[i] = two;
      mean += two / size;
    }
  }
  for (let i = 0; i < size; i++) line[i] -= mean;
  const keep = Math.pow(10, -3 / (freq * ring));
  let w = 0;
  let before = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    let r = w - delay;
    if (r < 0) r += size;
    const i0 = Math.floor(r);
    const frac = r - i0;
    const x = line[i0 % size] * (1 - frac) + line[(i0 + 1) % size] * frac;
    const y = keep * ((1 - blend) * x + blend * before);
    before = x;
    line[w] = y;
    out[i] = y;
    if (Math.abs(y) > peak) peak = Math.abs(y);
    w = (w + 1) % size;
  }
  // a few thousandths of a second to come in and to go out, so no stroke begins or ends with a click
  const edge = Math.floor(0.0025 * sr);
  for (let i = 0; i < n; i++) out[i] *= (1 / (peak || 1)) * Math.min(1, (i + 1) / edge, (n - i) / edge);
  return buf;
}

/**
 * A cymbal's metal: many pure tones that are no chord, the high ones dying first, under a splash of
 * noise from the stick. `ring` is about how many seconds the middle of it lasts.
 */
function cymbal(ctx: BaseAudioContext, seconds: number, low: number, high: number, ring: number, tones: number, seed: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const n = Math.floor(seconds * sr);
  const buf = ctx.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const rnd = dice(seed);
  for (let p = 0; p < tones; p++) {
    const f = low * Math.pow(high / low, (p + rnd()) / tones);
    const life = ring * Math.pow(f / 3000, -0.45) * (0.6 + 0.8 * rnd());
    const shrink = Math.exp(-1 / (life * sr));
    const turn = (2 * Math.PI * f) / sr;
    const [dc, ds] = [Math.cos(turn), Math.sin(turn)];
    const phase = rnd() * 2 * Math.PI;
    let [c, s] = [Math.cos(phase), Math.sin(phase)];
    let a = (0.5 + 0.5 * rnd()) * Math.pow(f / 3000, 0.15);
    for (let i = 0; i < n; i++) {
      d[i] += a * s;
      const c2 = c * dc - s * ds;
      s = s * dc + c * ds;
      c = c2;
      a *= shrink;
    }
  }
  // the stick's splash: bright noise that is gone almost at once, and a wash of it that lasts
  let last = 0;
  let peak = 0;
  const wash = Math.sqrt(tones) * 0.5;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const x = rnd() * 2 - 1;
    const bright = x - last;
    last = x;
    d[i] += bright * wash * (1.2 * Math.exp(-t / Math.max(0.01, ring * 0.04)) + 0.5 * Math.exp(-t / (ring * 0.9)));
    d[i] *= Math.min(1, (i + 1) / 48, (n - i) / (0.02 * sr));
    if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]);
  }
  for (let i = 0; i < n; i++) d[i] /= peak || 1;
  return buf;
}

/** A stretch of the music, ready to be written onto its clock a bar at a time. */
export interface Song {
  /** How long the music is, in seconds (what rings on after it is not counted). */
  length: number;
  bars: number;
  /** Writes everything that begins in bar `bar` of the stretch. Each bar is written once, in order, a little ahead of its time. */
  write(bar: number): void;
}

/** Writes all of `plan` onto the clock at once: for a short stretch. Returns its length in seconds. */
export function playSong(ctx: BaseAudioContext, out: AudioNode, t0: number, plan: Plan): number {
  const s = song(ctx, out, t0, plan);
  for (let b = 0; b < s.bars; b++) s.write(b);
  return s.length;
}

/**
 * Sets up `plan.bars` bars of the music on the clock `ctx`, to start at `t0` and sound into `out`.
 * Nothing is heard until its bars are written (`write`), which a player does a bar ahead: a note is
 * only made when its bar comes, so a long stretch costs no more than a short one.
 */
export function song(ctx: BaseAudioContext, out: AudioNode, t0: number, plan: Plan): Song {
  const from = plan.from ?? 0;
  const steps = plan.bars * 16;
  const fights = plan.fights ?? [];
  /** What is to be written, by the sixteenth it begins on. */
  const todo: Array<Array<() => void>> = [];
  const when = (step: number, make: () => void): void => {
    if (step < 0 || step >= steps) return;
    (todo[step] ??= []).push(make);
  };
  const level = (p: Part): number => (!plan.only || plan.only.includes(p) ? (plan.levels?.[p] ?? LEVELS[p]) : 0);
  const at = (step: number): number => t0 + step * STEP;
  const barOf = (step: number): number => (((from + Math.floor(step / 16)) % LOOP_BARS) + LOOP_BARS) % LOOP_BARS;
  const rnd = dice(20261009);
  /** A loudness that is never quite the same twice. */
  const human = (v: number): number => v * (0.94 + 0.12 * rnd());

  // --- the end of the chain: everything meets here ---
  const mix = ctx.createGain();
  const rumble = ctx.createBiquadFilter();
  rumble.type = 'highpass';
  rumble.frequency.value = 38;
  rumble.Q.value = 0.7;
  mix.connect(rumble);
  if (plan.raw) rumble.connect(out);
  else {
    const limit = ctx.createDynamicsCompressor();
    limit.threshold.value = -3;
    limit.knee.value = 3;
    limit.ratio.value = 20;
    limit.attack.value = 0.003;
    limit.release.value = 0.09;
    rumble.connect(limit).connect(out);
  }

  // --- the room, and an echo that bounces from side to side a dotted eighth apart ---
  const roomIn = ctx.createGain();
  const hall = ctx.createConvolver();
  hall.buffer = room(ctx, 3.2, 2.6);
  const roomHigh = ctx.createBiquadFilter();
  roomHigh.type = 'highpass';
  roomHigh.frequency.value = 260;
  const roomOut = ctx.createGain();
  roomOut.gain.value = 0.9 * (plan.wet ?? 1);
  roomIn.connect(hall).connect(roomHigh).connect(roomOut).connect(mix);

  const echoIn = ctx.createGain();
  const echoL = ctx.createDelay(1);
  const echoR = ctx.createDelay(1);
  echoL.delayTime.value = STEP * 3;
  echoR.delayTime.value = STEP * 3;
  const dull = ctx.createBiquadFilter();
  dull.type = 'lowpass';
  dull.frequency.value = 3200;
  const across = ctx.createGain();
  across.gain.value = 0.55;
  const back = ctx.createGain();
  back.gain.value = 0.55;
  const left = ctx.createStereoPanner();
  left.pan.value = -0.6;
  const right = ctx.createStereoPanner();
  right.pan.value = 0.6;
  echoIn.gain.value = plan.wet ?? 1;
  echoIn.connect(echoL);
  echoL.connect(left).connect(mix);
  echoL.connect(across).connect(dull).connect(echoR);
  echoR.connect(right).connect(mix);
  echoR.connect(back).connect(echoL);
  const echoRoom = ctx.createGain();
  echoRoom.gain.value = 0.3;
  echoL.connect(echoRoom);
  echoR.connect(echoRoom);
  echoRoom.connect(roomIn);

  /** A part's own way to the mix, with how much of it goes to the room and to the echo. */
  const bus = (p: Part, toRoom: number, toEcho: number): GainNode => {
    const g = ctx.createGain();
    g.gain.value = level(p);
    g.connect(mix);
    if (toRoom > 0) {
      const s = ctx.createGain();
      s.gain.value = toRoom;
      g.connect(s).connect(roomIn);
    }
    if (toEcho > 0) {
      const s = ctx.createGain();
      s.gain.value = toEcho;
      g.connect(s).connect(echoIn);
    }
    return g;
  };

  const pan = (where: number, into: AudioNode): StereoPannerNode => {
    const p = ctx.createStereoPanner();
    p.pan.value = where;
    p.connect(into);
    return p;
  };

  // ===========================================================================================
  // The dream half
  // ===========================================================================================

  // --- the wash: four notes, each a pair of saw waves a little apart, opened and closed slowly ---
  const padBus = bus('pad', 0.55, 0);
  const padDuck = ctx.createGain();
  padDuck.connect(padBus);
  const padTone = ctx.createBiquadFilter();
  padTone.type = 'lowpass';
  padTone.frequency.value = 3800;
  padTone.Q.value = 0.4;
  padTone.connect(padDuck);
  const breathe = ctx.createOscillator();
  breathe.frequency.value = 0.09;
  const breatheBy = ctx.createGain();
  breatheBy.gain.value = 700;
  breathe.connect(breatheBy).connect(padTone.frequency);
  breathe.start(t0);
  breathe.stop(t0 + steps * STEP + 6);

  const wash = (t: number, len: number, notes: number[]): void => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + 0.5);
    g.gain.setValueAtTime(1, t + len);
    g.gain.setTargetAtTime(0, t + len, 0.42);
    g.connect(padTone);
    notes.forEach((n, i) => {
      for (const side of [-1, 1]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = hz(n);
        o.detune.value = side * (8 + i);
        const own = ctx.createGain();
        own.gain.value = 0.11;
        o.connect(own).connect(pan(side * (0.35 + 0.1 * i), g));
        o.start(t);
        o.stop(t + len + 3);
      }
    });
  };

  // --- the soft low note under the wash ---
  const lowBus = bus('low', 0, 0);
  const lowTone = ctx.createBiquadFilter();
  lowTone.type = 'lowpass';
  lowTone.frequency.value = 520;
  lowTone.connect(lowBus);
  const deep = (t: number, len: number, root: number): void => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + 0.25);
    g.gain.setValueAtTime(1, t + len);
    g.gain.setTargetAtTime(0, t + len, 0.3);
    g.connect(lowTone);
    const a = ctx.createOscillator();
    a.type = 'triangle';
    a.frequency.value = hz(root);
    const b = ctx.createOscillator();
    b.type = 'sine';
    b.frequency.value = hz(root + 12);
    const bBy = ctx.createGain();
    bBy.gain.value = 0.55;
    a.connect(g);
    b.connect(bBy).connect(g);
    for (const o of [a, b]) {
      o.start(t);
      o.stop(t + len + 2.5);
    }
  };

  // the chords, each for as long as it lasts (two bars, or one where the fourth hangs and falls)
  for (let s = 0; s < steps; ) {
    const name = CHORD_OF_BAR[barOf(s)];
    let e = s + 16;
    while (e < steps && CHORD_OF_BAR[barOf(e)] === name && barOf(e) % 2 === 1) e += 16;
    const [start, len] = [s, (e - s) * STEP];
    when(start, () => {
      wash(at(start), len, CHORDS[name].pad);
      deep(at(start), len, CHORDS[name].root);
    });
    s = e;
  }

  // --- the lead: a clear singing tone, two of them a little apart, that slides from note to note ---
  const leadBus = bus('lead', 0.42, 0.3);
  const leadLift = ctx.createGain();
  leadLift.connect(leadBus);
  const leadTone = ctx.createBiquadFilter();
  leadTone.type = 'lowpass';
  leadTone.frequency.value = 3600;
  leadTone.Q.value = 0.6;
  leadTone.connect(leadLift);
  // the lead's bright edge: only a little of it in the dream, all of it in a fight, as a singer goes from soft to full voice
  const leadEdge = ctx.createGain();
  leadEdge.gain.value = EDGE_IN_DREAM;
  leadEdge.connect(leadTone);

  const sing = (t: number, len: number, n: number, slideFrom: number | null, loud: number): void => {
    for (const side of [-1, 1]) {
      const start = t + (side > 0 ? 0.011 : 0);
      const shaped = (into: AudioNode): GainNode => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(loud, start + 0.05);
        g.gain.linearRampToValueAtTime(loud * 1.06, start + Math.max(0.06, len * 0.6));
        g.gain.setTargetAtTime(0, start + len - 0.02, 0.07);
        g.connect(pan(side * 0.3, into));
        return g;
      };
      const soft = shaped(leadTone);
      const edge = shaped(leadEdge);
      // the wobble of a held voice: none at first, then it grows
      const wob = ctx.createOscillator();
      wob.frequency.value = 5.4 + side * 0.15;
      const wobBy = ctx.createGain();
      wobBy.gain.setValueAtTime(0, start);
      wobBy.gain.setValueAtTime(0, start + 0.22);
      wobBy.gain.linearRampToValueAtTime(13, start + 0.6);
      wob.connect(wobBy);
      const kinds: Array<[OscillatorType, number, GainNode]> = [['triangle', 1, soft], ['sawtooth', 1.2, edge]];
      for (const [kind, by, g] of kinds) {
        const o = ctx.createOscillator();
        o.type = kind;
        if (slideFrom === null) o.frequency.setValueAtTime(hz(n), start);
        else {
          o.frequency.setValueAtTime(hz(slideFrom), start);
          o.frequency.exponentialRampToValueAtTime(hz(n), start + 0.06);
        }
        o.detune.value = side * 5;
        wobBy.connect(o.detune);
        const own = ctx.createGain();
        own.gain.value = by;
        o.connect(own).connect(g);
        o.start(start);
        o.stop(start + len + 0.6);
      }
      wob.start(start);
      wob.stop(start + len + 0.6);
    }
  };

  /** Plays a written voice over the bars of this stretch, round and round the tune. */
  const sung = (tones: Tone[], loud: number): void => {
    const loopBeats = LOOP_BARS * 4;
    const first = from * 4;
    const last = first + plan.bars * 4;
    for (let round = Math.floor(first / loopBeats); round * loopBeats < last; round++) {
      tones.forEach((tone, i) => {
        const b = tone.at + round * loopBeats;
        if (b < first || b >= last) return;
        const prev = tones[(i + tones.length - 1) % tones.length];
        const prevEnd = i === 0 ? prev.at + prev.len - loopBeats : prev.at + prev.len;
        const joined = Math.abs(prevEnd - tone.at) < 1e-9 && b > first;
        when(Math.round((b - first) * 4), () => sing(t0 + (b - first) * BEAT, Math.min(tone.len, last - b) * BEAT, tone.n, joined ? prev.n : null, loud));
      });
    }
  };
  sung(voice(LEAD), 0.5);
  sung(voice(HARMONY), 0.3);

  // --- the sparkle: small bright plucks on the eighths, thrown from side to side by the echo ---
  const sparkleBus = bus('sparkle', 0.4, 0.5);
  const glint = (t: number, n: number, loud: number, where: number): void => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(loud, t + 0.005);
    g.gain.setTargetAtTime(0, t + 0.005, 0.11);
    g.connect(pan(where, sparkleBus));
    // a synth's pluck: bright for an instant, then it closes
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = 0.9;
    tone.frequency.setValueAtTime(5200, t);
    tone.frequency.setTargetAtTime(1100, t + 0.005, 0.07);
    tone.connect(g);
    const kinds: Array<[OscillatorType, number]> = [['sawtooth', 0.5], ['sine', 0.7]];
    for (const [kind, by] of kinds) {
      const o = ctx.createOscillator();
      o.type = kind;
      o.frequency.value = hz(n);
      const own = ctx.createGain();
      own.gain.value = by;
      o.connect(own).connect(tone);
      o.start(t);
      o.stop(t + 0.9);
    }
  };
  const UP_AND_ROCK = [0, 2, 3, 2, 4, 2, 3, 1];
  const UP_AND_DOWN = [0, 1, 2, 3, 4, 3, 2, 1];
  for (let s = 0; s < steps; s += 2) {
    const bar = barOf(s);
    const eighth = (s % 16) / 2;
    const shape = bar < 16 ? UP_AND_ROCK : UP_AND_DOWN;
    const n = CHORDS[CHORD_OF_BAR[bar]].glint[shape[eighth]];
    const leaning = eighth === 0 || eighth === 3 || eighth === 6;
    const step = s;
    when(step, () => glint(at(step), n, human(leaning ? 0.5 : 0.3), eighth % 2 ? 0.45 : -0.45));
  }

  // ===========================================================================================
  // The thrash half
  // ===========================================================================================

  if (fights.length > 0) {
    const over = t0 + steps * STEP + 4;

    // --- the kit: struck things worked out in code, in a small room of their own ---
    const drumBus = bus('drums', 0, 0);
    const kitOn = level('drums') > 0 ? 1 : 0;
    const drumHall = ctx.createGain();
    drumHall.gain.value = kitOn;
    drumHall.connect(roomIn);
    const booth = ctx.createConvolver();
    booth.buffer = room(ctx, 0.5, 0.36);
    const boothIn = ctx.createGain();
    const boothOut = ctx.createGain();
    boothOut.gain.value = 0.55;
    boothIn.connect(booth).connect(boothOut).connect(drumBus);

    const hiss = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
    {
      const d = hiss.getChannelData(0);
      const r = dice(4242);
      for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
    }
    const crashMetal = cymbal(ctx, 2.6, 330, 12500, 0.95, 150, 71);
    const rideMetal = cymbal(ctx, 0.9, 900, 11500, 0.32, 80, 72);
    const hatMetal = cymbal(ctx, 0.16, 3600, 12500, 0.03, 60, 73);
    const kit = (d: Drum): number => plan.kit?.[d] ?? 1;

    /** A burst of noise between two pitches: wires, sticks and beaters. With `darken` its top falls as it dies. */
    const burst = (t: number, o: { low: number; high: number; loud: number; attack: number; fade: number; len: number; darken?: number }, into: AudioNode): void => {
      const src = ctx.createBufferSource();
      src.buffer = hiss;
      src.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = o.low;
      hp.Q.value = 0.7;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 0.7;
      lp.frequency.setValueAtTime(o.high, t);
      if (o.darken) lp.frequency.setTargetAtTime(o.darken, t + o.attack, o.fade * 1.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(o.loud, t + o.attack);
      g.gain.setTargetAtTime(0, t + o.attack, o.fade);
      src.connect(hp).connect(lp).connect(g).connect(into);
      src.start(t, rnd() * 1.2, o.len);
    };
    /** A tone that drops in pitch as it dies: a skin, struck. */
    const thump = (t: number, kind: OscillatorType, fromHz: number, toHz: number, drop: number, loud: number, fade: number, len: number, into: AudioNode): void => {
      const o = ctx.createOscillator();
      o.type = kind;
      o.frequency.setValueAtTime(fromHz, t);
      o.frequency.exponentialRampToValueAtTime(toHz, t + drop);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(loud, t + 0.0015);
      g.gain.setTargetAtTime(0, t + 0.0015, fade);
      o.connect(g).connect(into);
      o.start(t);
      o.stop(t + len);
    };
    /** A cymbal's metal, played from the start. */
    const metal = (t: number, buf: AudioBuffer, loud: number, into: AudioNode): void => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.value = loud;
      src.connect(g).connect(into);
      src.start(t);
    };

    // one kick drum, struck again and again: each blow starts it afresh, as a real one does
    const kickDrive = ctx.createWaveShaper();
    kickDrive.curve = grit(1.8);
    kickDrive.connect(drumBus);
    const kickSkin = ctx.createOscillator();
    kickSkin.type = 'sine';
    kickSkin.frequency.value = 57;
    const kickLoud = ctx.createGain();
    kickLoud.gain.value = 0;
    kickSkin.connect(kickLoud).connect(kickDrive);
    kickSkin.start(t0);
    kickSkin.stop(over);
    const kick = (t: number, hit: number): void => {
      const v = hit * kit('kick');
      if (v <= 0) return;
      kickSkin.frequency.setValueAtTime(128, t);
      kickSkin.frequency.exponentialRampToValueAtTime(57, t + 0.03);
      kickLoud.gain.setTargetAtTime(v, t, 0.0007);
      kickLoud.gain.setTargetAtTime(0, t + 0.004, 0.028);
      // the knock of the skin and the click of the beater: what a phone's speaker shows of a kick
      thump(t, 'triangle', 330, 160, 0.016, v * 0.75, 0.013, 0.08, kickDrive);
      burst(t, { low: 1600, high: 6000, loud: v * 1.5, attack: 0.0004, fade: 0.0045, len: 0.04 }, drumBus);
    };
    const snareDrive = ctx.createWaveShaper();
    snareDrive.curve = grit(1.4);
    snareDrive.connect(drumBus);
    const snare = (t: number, hit: number, tight: boolean): void => {
      const v = hit * kit('snare');
      if (v <= 0) return;
      const dry = ctx.createGain();
      dry.connect(snareDrive);
      const near = ctx.createGain();
      near.gain.value = 0.5;
      dry.connect(near).connect(boothIn);
      const far = ctx.createGain();
      far.gain.value = tight ? 0.05 : 0.14;
      dry.connect(far).connect(drumHall);
      // the shell: three notes that are not a chord, each gone in a blink
      thump(t, 'sine', 222, 196, 0.02, v * 0.6, 0.045, 0.3, dry);
      thump(t, 'sine', 350, 312, 0.015, v * 0.34, 0.03, 0.2, dry);
      thump(t, 'triangle', 500, 452, 0.012, v * 0.16, 0.018, 0.12, dry);
      // the wires under it, and the stick on top
      burst(t, { low: 900, high: 8500, loud: v * 0.75, attack: 0.001, fade: tight ? 0.032 : 0.055, len: 0.36, darken: 5000 }, dry);
      burst(t, { low: 2000, high: 9000, loud: v * 0.55, attack: 0.0004, fade: 0.005, len: 0.04 }, dry);
    };
    const hat = (t: number, v: number): void => {
      if (kit('hat') <= 0) return;
      metal(t, hatMetal, v * kit('hat') * 0.16, pan(0.3, drumBus));
    };
    const ride = (t: number, v: number): void => {
      if (kit('ride') <= 0) return;
      metal(t, rideMetal, v * kit('ride') * 0.17, pan(0.3, drumBus));
    };
    const crash = (t: number, hit: number): void => {
      const v = hit * kit('crash');
      if (v <= 0) return;
      const dry = ctx.createGain();
      dry.connect(pan(-0.3, drumBus));
      const far = ctx.createGain();
      far.gain.value = 0.15;
      dry.connect(far).connect(drumHall);
      metal(t, crashMetal, v * 0.32, dry);
      burst(t, { low: 3000, high: 11000, loud: v * 0.16, attack: 0.002, fade: 0.3, len: 1.8, darken: 4500 }, dry);
    };
    const tom = (t: number, hit: number, pitch: number): void => {
      const v = hit * kit('tom');
      if (v <= 0) return;
      const dry = ctx.createGain();
      dry.connect(pan(pitch > 150 ? -0.25 : 0.25, drumBus));
      const near = ctx.createGain();
      near.gain.value = 0.5;
      dry.connect(near).connect(boothIn);
      thump(t, 'sine', pitch * 1.35, pitch, 0.07, v * 0.85, 0.075, 0.45, dry);
      thump(t, 'sine', pitch * 2.1, pitch * 1.6, 0.03, v * 0.25, 0.03, 0.2, dry);
      burst(t, { low: 1500, high: 6000, loud: v * 0.35, attack: 0.0004, fade: 0.004, len: 0.04 }, dry);
    };

    // --- the strings: every stroke is a plucked string worked out in code, pushed hard through an amp ---
    const strings = new Map<string, AudioBuffer>();
    const stringOf = (n: number, palmed: boolean, take: number, soft: number): AudioBuffer => {
      const key = `${n}${palmed ? 'p' : 'o'}${take}`;
      let b = strings.get(key);
      if (!b) {
        b = palmed ? pluck(ctx, hz(n), 0.42, 0.2, 0.7, 1000 + n * 31 + take * 7) : pluck(ctx, hz(n), 1.8, 3.2, soft, 5000 + n * 31 + take * 7);
        strings.set(key, b);
      }
      return b;
    };
    /** An amp and its speaker box: strings go in one end, a wall comes out of the other. */
    const amp = (o: { push: number; tight: number; mids: number; floor: number; thump: number; top: number; where: number; into: AudioNode }): GainNode => {
      const filter = (type: BiquadFilterType, freq: number, q: number, gain = 0): BiquadFilterNode => {
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = q;
        f.gain.value = gain;
        return f;
      };
      const input = ctx.createGain();
      const push = ctx.createGain();
      push.gain.value = o.push;
      const shape = ctx.createWaveShaper();
      shape.curve = grit(5);
      shape.oversample = '4x';
      input
        .connect(filter('highpass', o.tight, 0.7))
        .connect(filter('peaking', 800, 0.8, o.mids))
        .connect(push)
        .connect(shape)
        .connect(filter('highpass', o.floor, 0.7))
        .connect(filter('peaking', 115, 1.2, o.thump))
        .connect(filter('peaking', 450, 1, -2))
        .connect(filter('lowpass', o.top, 0.7))
        .connect(filter('lowpass', o.top, 0.7))
        .connect(pan(o.where, o.into));
      return input;
    };
    interface Hand {
      /** Strike these notes at `t`: 'chug' is cut short by the palm, 'pick' is one fast stroke, 'ring' is let go. */
      strike(t: number, notes: number[], v: number, how: 'chug' | 'pick' | 'ring'): void;
      /** Stop the strings. */
      hush(t: number, fade?: number): void;
    }
    const hand = (into: GainNode, firstTake: number, soft = 0.2): Hand => {
      let last: GainNode | null = null;
      let count = 0;
      return {
        strike: (t, notes, v, how) => {
          if (last) last.gain.setTargetAtTime(0, t, how === 'chug' ? 0.004 : 0.02);
          const g = ctx.createGain();
          g.gain.setValueAtTime(v, t);
          const take = firstTake + (count++ % 2);
          for (const n of notes) {
            const src = ctx.createBufferSource();
            src.buffer = stringOf(n, how === 'chug', take, soft);
            src.connect(g);
            src.start(t);
          }
          g.connect(into);
          last = g;
        },
        hush: (t, fade = 0.01) => {
          if (last) last.gain.setTargetAtTime(0, t, fade);
        },
      };
    };

    /** The plain-synth way to make the wall: saw waves held down, opened by each stroke, squashed and rounded off. */
    const sawHand = (o: { waves: OscillatorType[]; cents: number; gritBy: number; push: number; floor: number; top: number; where: number; into: AudioNode }): Hand => {
      const pre = ctx.createGain();
      pre.gain.value = 0;
      const push = ctx.createGain();
      push.gain.value = o.push / o.waves.length;
      const shape = ctx.createWaveShaper();
      shape.curve = grit(o.gritBy);
      shape.oversample = '4x';
      const boxLow = ctx.createBiquadFilter();
      boxLow.type = 'highpass';
      boxLow.frequency.value = o.floor;
      const box = ctx.createBiquadFilter();
      box.type = 'lowpass';
      box.frequency.value = o.top;
      box.Q.value = 0.6;
      const palm = ctx.createBiquadFilter();
      palm.type = 'lowpass';
      palm.frequency.value = o.top;
      const post = ctx.createGain();
      post.gain.value = 0;
      pre.connect(push).connect(shape).connect(boxLow).connect(box).connect(palm).connect(post).connect(pan(o.where, o.into));
      const oscs = o.waves.map((w, i) => {
        const osc = ctx.createOscillator();
        osc.type = w;
        osc.detune.value = o.cents + (i - (o.waves.length - 1) / 2) * 3;
        osc.connect(pre);
        osc.start(t0);
        osc.stop(over);
        return osc;
      });
      return {
        strike: (t, notes, v, how) => {
          oscs.forEach((osc, i) => osc.frequency.setValueAtTime(hz(notes[i % notes.length]), t));
          const rest = how === 'chug' ? 0.1 : how === 'pick' ? 0.5 : 0.75;
          const fade = how === 'chug' ? 0.022 : how === 'pick' ? 0.03 : 0.3;
          for (const g of [pre.gain, post.gain]) {
            g.setTargetAtTime(v, t, 0.0012);
            g.setTargetAtTime(v * rest, t + 0.005, fade);
          }
          if (how === 'chug') {
            palm.frequency.setTargetAtTime(o.top * 0.8, t, 0.001);
            palm.frequency.setTargetAtTime(520, t + 0.005, 0.02);
          } else palm.frequency.setTargetAtTime(o.top, t, 0.002);
        },
        hush: (t, fade = 0.012) => {
          pre.gain.setTargetAtTime(0, t, fade);
          post.gain.setTargetAtTime(0, t, fade);
        },
      };
    };

    const saws = plan.wall === 'saws';
    const chugBus = bus('chug', 0.05, 0);
    const chugTrim = ctx.createGain();
    chugTrim.gain.value = saws ? SAW_TRIM.chug : 1;
    chugTrim.connect(chugBus);
    const chugs = [-1, 1].map((side, i) => saws
      ? sawHand({ waves: ['sawtooth', 'sawtooth', 'sawtooth'], cents: side * 5, gritBy: 4, push: 3, floor: 105, top: 3200, where: side * 0.75, into: chugTrim })
      : hand(amp({ push: 2.4, tight: 95, mids: 3, floor: 70, thump: 4, top: 3900, where: side * 0.8, into: chugTrim }), i * 2));
    const riffBus = bus('riff', 0.3, 0.06);
    const riffTrim = ctx.createGain();
    riffTrim.gain.value = saws ? SAW_TRIM.riff : 1;
    riffTrim.connect(riffBus);
    const riffs = [1, -1].map((side, i) => saws
      ? sawHand({ waves: ['sawtooth', 'sawtooth'], cents: side * 4, gritBy: 2.5, push: 2.2, floor: 330, top: 3000, where: side * 0.45, into: riffTrim })
      : hand(amp({ push: 4, tight: 250, mids: 2, floor: 280, thump: 0, top: 3600, where: side * 0.45, into: riffTrim }), 4 + i * 2));
    const bassBus = bus('bass', 0, 0);
    const bassTrim = ctx.createGain();
    bassTrim.gain.value = saws ? SAW_TRIM.bass : 1;
    bassTrim.connect(bassBus);
    const bass = saws
      ? sawHand({ waves: ['sawtooth', 'square'], cents: 0, gritBy: 2, push: 1.6, floor: 45, top: 950, where: 0, into: bassTrim })
      : hand(amp({ push: 0.8, tight: 40, mids: 0, floor: 40, thump: 3, top: 420, where: 0, into: bassTrim }), 8, 0.65);

    /** A real player is never quite on the dot: up to three thousandths of a second either way. */
    const loose = (t: number): number => Math.max(t0, t + (rnd() - 0.5) * 0.006);

    /** What the thrash half plays on one sixteenth. */
    const thrash = (step: number): void => {
      const t = at(step);
      const bar = barOf(step);
      const s = ((step % 16) + 16) % 16;
      const drive = DRIVE_OF_EIGHT[Math.floor(bar / 8)];
      const onBeat = s % 4 === 0;
      const fill = bar % 8 === 7 && s >= 8;
      const root = CHORDS[CHORD_OF_BAR[bar]].root;
      const fifth = [root, root + 7, root + 12];

      // drums
      if (fill) {
        if (s < 12) snare(t, human(0.62 + 0.07 * (s - 8)), true);
        else tom(t, human(0.85 + 0.04 * (s - 12)), s < 14 ? 190 : 125);
        if (onBeat) kick(t, human(0.95));
      } else {
        if (drive === 'gallop') { if (GALLOP[s % 4]) kick(t, human(onBeat ? 1 : 0.72)); }
        else if (drive === 'blast') { if (s % 2 === 0) kick(t, human(0.9)); }
        else kick(t, human(onBeat ? 1 : 0.7));
        if (drive === 'halftime') { if (s === 8) snare(t, human(1), false); }
        else if (drive === 'blast') { if (s % 2 === 1) snare(t, human(0.58), true); }
        else if (s === 4 || s === 12) snare(t, human(1), false);
        if (drive === 'gallop') { if (s % 2 === 0) hat(t, human(onBeat ? 0.9 : 0.55)); }
        else if (drive === 'halftime') { if (onBeat) ride(t, human(0.9)); }
        else if (s % 2 === 0) ride(t, human(onBeat ? 0.8 : 0.5));
      }
      if (s === 0) {
        if (bar % 2 === 0) crash(t, bar % 8 === 0 ? 1 : 0.75);
        else if (drive === 'halftime') crash(t, 0.5);
      }

      // the wall of chords, and the bass under it
      const wall = (v: number, how: 'chug' | 'pick' | 'ring'): void => {
        for (const c of chugs) c.strike(loose(t), fifth, human(v), how);
        bass.strike(t, [root], human(v), 'pick');
      };
      if (drive === 'gallop') { if (GALLOP[s % 4]) wall(onBeat ? 1 : 0.8, 'chug'); }
      else if (drive === 'race') wall(onBeat ? 1 : 0.8, s === 0 && bar % 2 === 0 ? 'pick' : 'chug');
      else if (drive === 'halftime') {
        if (s === 0) wall(1, 'ring');
        else if (bar % 2 === 1 && s >= 12) wall(0.85, 'chug');
        else if (s % 2 === 0) bass.strike(t, [root], human(0.9), 'pick');
      } else wall(onBeat ? 1 : 0.85, 'pick');

      // the picked riff, two voices
      const share = (line: string[]): number => note(line[Math.floor((s * line.length) / 16)]);
      riffs[0].strike(loose(t), [share(RIFF_HIGH[bar])], human(onBeat ? 1 : 0.85), 'pick');
      riffs[1].strike(loose(t), [share(RIFF_LOW[bar])], human((onBeat ? 1 : 0.85) * (drive === 'gallop' ? 0.75 : 0.95)), 'pick');
    };

    for (const [a, b] of fights) {
      const first = Math.round(a * 4);
      const end = Math.round(b * 4);
      // a beat of drums to say it is coming, then everything at once with a crash
      for (let i = 0; i < 4; i++) {
        const step = first - 4 + i;
        when(step, () => {
          if (i < 2) snare(at(step), 0.55 + 0.15 * i, true);
          else tom(at(step), 0.8 + 0.1 * (i - 2), i === 2 ? 190 : 125);
        });
      }
      for (let step = Math.max(0, first); step < Math.min(steps, end); step++) when(step, () => thrash(step));
      when(first, () => {
        if (!(first % 16 === 0 && barOf(first) % 2 === 0)) crash(at(first), 1);
        // in a fight the lead goes to full voice (its bright edge comes in, a little louder in all) and the
        // wash steps back, so the tune rides over the wall
        leadLift.gain.setTargetAtTime(0.76, at(first), 0.03);
        leadEdge.gain.setTargetAtTime(1, at(first), 0.03);
        padDuck.gain.setTargetAtTime(0.7, at(first), 0.03);
      });
      // the room is clear: one last blow, and the thrash half falls away
      when(end, () => {
        const t = at(end);
        const root = CHORDS[CHORD_OF_BAR[barOf(end)]].root;
        kick(t, 1);
        crash(t, 0.9);
        for (const c of chugs) {
          c.strike(t, [root, root + 7, root + 12], 1, 'ring');
          c.hush(t + 0.5, 0.09);
        }
        bass.strike(t, [root], 1, 'pick');
        bass.hush(t + 0.4, 0.05);
        for (const r of riffs) r.hush(t);
        leadLift.gain.setTargetAtTime(1, t, 0.25);
        leadEdge.gain.setTargetAtTime(EDGE_IN_DREAM, t, 0.25);
        padDuck.gain.setTargetAtTime(1, t, 0.25);
      });
      // (a fight still on when the stretch ends is simply stopped there)
      if (end >= steps) when(steps - 1, () => { for (const x of [...chugs, ...riffs, bass]) x.hush(at(steps), 0.03); });
    }
  }

  return {
    length: steps * STEP,
    bars: plan.bars,
    write: (bar) => {
      for (let step = bar * 16; step < bar * 16 + 16; step++) {
        for (const make of todo[step] ?? []) make();
        delete todo[step];
      }
    },
  };
}
