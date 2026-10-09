// Reads the tune as written (src/engine/music.ts) and checks it the way a music teacher would:
//   - every note is in the key (D major);
//   - every bar is four beats;
//   - where a voice holds a note for two beats or more, that note belongs to the chord of the bar
//     (its root, third, fifth, seventh or ninth), or the hanging fourth where the chord says so;
//   - no two voices sit a semitone or a tritone apart for a beat or more;
//   - the riff's two voices never cross, and never sit a second apart.
// It prints what it finds and fails if anything is wrong.
//   tsx tools/sound/check_score.ts
import { CHORDS, CHORD_OF_BAR, HARMONY, LEAD, LOOP_BARS, RIFF_HIGH, RIFF_LOW, note, voice, type ChordName } from '../../src/engine/music';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const name = (n: number): string => NAMES[n % 12] + (Math.floor(n / 12) - 1);
const KEY = new Set([2, 4, 6, 7, 9, 11, 1]); // D E F# G A B C#
/** The notes that sit well held over each chord: root, third, fifth, seventh, ninth (and the hanging fourth). */
const AT_HOME: Record<ChordName, number[]> = {
  G: [7, 11, 2, 6, 9], // G B D F# A
  D: [2, 6, 9, 1, 4], // D F# A C# E
  Asus: [9, 2, 4, 11, 7], // A D E B (G)
  A: [9, 1, 4, 11, 7], // A C# E B (G)
  Bm: [11, 2, 6, 9, 1, 4], // B D F# A C# (E, the hanging fourth)
};

let wrong = 0;
const say = (ok: boolean, text: string): void => {
  if (!ok) { wrong++; console.log('WRONG  ' + text); }
};

if (CHORD_OF_BAR.length !== LOOP_BARS || LEAD.length !== LOOP_BARS || HARMONY.length !== LOOP_BARS || RIFF_HIGH.length !== LOOP_BARS || RIFF_LOW.length !== LOOP_BARS) {
  say(false, 'a part is not ' + LOOP_BARS + ' bars long');
}

const lead = voice(LEAD);
const harmony = voice(HARMONY);
console.log(`lead: ${lead.length} notes, ${name(Math.min(...lead.map((t) => t.n)))} to ${name(Math.max(...lead.map((t) => t.n)))}; harmony: ${harmony.length} notes`);

/** The notes of each voice sounding at each sixteenth of the tune. */
const steps = LOOP_BARS * 16;
const sounding = (tones: { at: number; len: number; n: number }[]): Array<number | null> => {
  const out: Array<number | null> = new Array(steps).fill(null);
  for (const t of tones) for (let s = Math.round(t.at * 4); s < Math.round((t.at + t.len) * 4); s++) out[s] = t.n;
  return out;
};
const riffSteps = (lines: string[][]): number[] => {
  const out: number[] = [];
  lines.forEach((line) => { for (let s = 0; s < 16; s++) out.push(note(line[Math.floor((s * line.length) / 16)])); });
  return out;
};
const voices: Record<string, Array<number | null>> = {
  lead: sounding(lead), harmony: sounding(harmony), riffHigh: riffSteps(RIFF_HIGH), riffLow: riffSteps(RIFF_LOW),
};

// in the key
for (const [who, line] of Object.entries(voices)) {
  line.forEach((n, s) => { if (n !== null) say(KEY.has(n % 12), `${who}: ${name(n)} in bar ${Math.floor(s / 16)} is not in D major`); });
}
for (const [chordName, c] of Object.entries(CHORDS)) {
  for (const n of [...c.pad, ...c.glint, c.root]) say(KEY.has(n % 12), `chord ${chordName}: ${name(n)} is not in D major`);
}

// held notes belong to the chord
for (const [who, tones] of [['lead', lead], ['harmony', harmony]] as const) {
  for (const t of tones) {
    for (let b = Math.floor(t.at / 4); b * 4 < t.at + t.len; b++) {
      const from = Math.max(t.at, b * 4);
      const to = Math.min(t.at + t.len, b * 4 + 4);
      if (to - from < 2) continue;
      const chord = CHORD_OF_BAR[b];
      say(AT_HOME[chord].includes(t.n % 12) || (chord === 'Bm' && t.n % 12 === 4), `${who}: ${name(t.n)} held ${to - from} beats over ${chord} in bar ${b}`);
    }
  }
}
for (const [who, lines] of [['riffHigh', RIFF_HIGH], ['riffLow', RIFF_LOW]] as const) {
  lines.forEach((line, b) => {
    const chord = CHORD_OF_BAR[b];
    line.forEach((nm, i) => {
      const beats = 4 / line.length;
      if (beats >= 2) say(AT_HOME[chord].includes(note(nm) % 12), `${who}: ${nm} held ${beats} beats over ${chord} in bar ${b}`);
      else if (i === 0) say(AT_HOME[chord].includes(note(nm) % 12), `${who}: bar ${b} opens on ${nm} over ${chord}`);
    });
  });
}

// voices against each other: a semitone (1 or 11 apart, in any octave) or a tritone (6) for a beat or more
const pairs: Array<[string, string]> = [['lead', 'harmony'], ['lead', 'riffHigh'], ['lead', 'riffLow'], ['harmony', 'riffHigh'], ['harmony', 'riffLow'], ['riffHigh', 'riffLow']];
for (const [a, b] of pairs) {
  let run = 0;
  let kind = '';
  for (let s = 0; s <= steps; s++) {
    const [x, y] = [voices[a][s] ?? null, voices[b][s] ?? null];
    const apart = x === null || y === null || s === steps ? -1 : Math.abs(x - y) % 12;
    const clash = apart === 1 || apart === 11 ? 'a semitone' : apart === 6 ? 'a tritone' : '';
    if (clash && clash === kind) run++;
    else {
      if (run >= 4) say(false, `${a} and ${b} sit ${kind} apart for ${run / 4} beats, ending in bar ${Math.floor((s - 1) / 16)}`);
      run = clash ? 1 : 0;
      kind = clash;
    }
  }
}

// the lead against the wash under it: a semitone against a chord note for two beats or more
for (const t of lead) {
  for (let b = Math.floor(t.at / 4); b * 4 < t.at + t.len; b++) {
    const beats = Math.min(t.at + t.len, b * 4 + 4) - Math.max(t.at, b * 4);
    const rub = CHORDS[CHORD_OF_BAR[b]].pad.find((p) => [1, 11].includes(Math.abs(p - t.n) % 12));
    if (beats >= 2) say(rub === undefined, `lead: ${name(t.n)} rubs against ${rub === undefined ? '' : name(rub)} of the wash for ${beats} beats in bar ${b}`);
  }
}

// the riff's two voices
voices.riffHigh.forEach((hi, s) => {
  const lo = voices.riffLow[s];
  if (hi === null || lo === null || s % 4 !== 0) return;
  say(hi >= lo, `riff: the voices cross in bar ${Math.floor(s / 16)}`);
  say(![1, 2].includes(hi - lo), `riff: the voices sit a second apart in bar ${Math.floor(s / 16)} (${name(lo)}, ${name(hi)})`);
});

// how the lead moves: mostly by step, and a leap of a fifth or more is rare
let stepsMoved = 0;
let leaps = 0;
for (let i = 1; i < lead.length; i++) {
  const d = Math.abs(lead[i].n - lead[i - 1].n);
  if (d <= 2) stepsMoved++;
  if (d >= 7) leaps++;
}
console.log(`lead: ${stepsMoved} of ${lead.length - 1} moves are by step, ${leaps} are leaps of a fifth or more`);
console.log(wrong ? `${wrong} things wrong` : 'the tune checks out: in key, four beats a bar, held notes at home on their chords, no clashes between voices');
process.exit(wrong ? 1 : 0);
