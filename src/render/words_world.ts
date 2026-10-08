// (MOCK-UP, NOT IN THE GAME) WORDS IN THE WORLD: the letters of a power word, shown on the things
// that carry it. Behind one switch, `WORDS_LOOK.on`, which is OFF: with it off nothing here is drawn.
//
// The owner, 8 Oct 2026: asked (07:49) "Wordsmithing is the heart of the game. Should letters show in
// the world itself?", he answered (07:56) "Somewhere between 1 and 2" (between "Everywhere" and "Only
// where a word works"); and at 08:58, of what the art chat should take up next, "Words in the world
// (Recommended)". The art rulebook's rules for it ("Words in the world"): a word shows its letters
// (gear with a word burned into it, and a monster carrying one, show glowing letters in that word's
// colour); carved words as landmarks, rare enough to notice; the game's own letter; the words win.
//
// What this module draws (each part is a question for him, compared by eye with the game as it is):
//   - A MONSTER THAT HAS A WORD (an elite, a guardian, the Warden): 'ring', the dotted ring on the
//     floor under it is WRITTEN IN ITS WORD instead, the word round and round it, turning slowly,
//     reading left to right along the side toward the eye.
//   - THE HERO'S WEAPON WITH A WORD BURNED INTO IT: 'rise', the word's letters rise off the blade (or
//     the crystal) one after another, in a column that reads from the top down; the whole word
//     holds a moment, fades, and is spelled again after a pause.
//   - A WORD CARVED IN A WALL (art/carving.ts; render.ts stands it where a tapestry would hang):
//     'plain', cut into the stone; 'glow', cut, and lit from inside in the word's colour.
//   Tried and dropped before anything was shown to him: letters sparking up off a monster's ring
//   (they crossed its legs and read as noise) and the word laid along the blade (on most frames the
//   blade is too short on the screen for a word: the letters ran together).
// Every letter is the game's own (engine/font.ts), in the small font, at the screen's grain.
import { WORD_COLOR } from '../art/icons';
import { drawText, textWidth } from '../engine/font';
import { WORDS } from '../game/defs';
import type { WordId } from '../game/types';

export const WORDS_LOOK: { on: boolean; monster: 'ring' | 'off'; gear: 'rise' | 'off'; carved: 'plain' | 'glow' | 'off' } = {
  on: false,
  monster: 'ring',
  gear: 'rise',
  carved: 'plain',
};

/** A word as it is written in the world: its own name, in capitals ("FLAME" for fire). */
export function wordText(w: WordId): string {
  return WORDS[w].name.toUpperCase();
}

/** A point of the world on the screen (render.ts gives wx and wy with its camera). */
export type ToScreen = (x: number, y: number) => readonly [number, number];

/**
 * THE RING OF LETTERS on the floor round (x, y), `r` tiles out: the word, again and again, a space
 * between, laid out evenly round the ring as the eye sees it (a circle on the floor is an oval twice
 * as wide as it is tall), and turning slowly. The half of it toward the eye is drawn full, the far
 * half a little dimmer, so that it reads as lying on the floor.
 */
export function letterRing(g: CanvasRenderingContext2D, at: ToScreen, x: number, y: number, r: number, w: WordId, t: number): void {
  const [cx, cy] = at(x, y);
  // the oval, sampled finely, and the length round it on the screen
  const N = 96;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    // (round the way that reads left to right along the near side)
    const a = -(i / N) * Math.PI * 2;
    pts.push([...at(x + Math.cos(a) * r, y + Math.sin(a) * r)] as [number, number]);
  }
  const run: number[] = [0];
  for (let i = 1; i <= N; i++) run.push(run[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const round = run[N];
  // as many whole words as fit, each followed by a space
  const unit = wordText(w) + ' ';
  const unitW = textWidth(unit, 'small') + 1;
  const n = Math.max(1, Math.floor(round / unitW));
  const chars: string[] = [];
  for (let k = 0; k < n; k++) for (const ch of unit) chars.push(ch);
  const step = round / chars.length;
  const turn = (t * 7) % round;
  const col = WORD_COLOR[w];
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    const s = (i * step + turn) % round;
    let j = 1;
    while (j < N && run[j] < s) j++;
    const k = (s - run[j - 1]) / Math.max(1e-6, run[j] - run[j - 1]);
    const px = pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * k;
    const py = pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * k;
    g.globalAlpha = py >= cy ? 1 : 0.6;
    drawText(g, ch, Math.round(px), Math.round(py) - 3, col, { font: 'small', align: 'center' });
  });
  g.globalAlpha = 1;
}

/** One letter rising off something that carries a word: where it came from in the world, where on the screen from there, when it was given off, and which spelling of the word it belongs to. */
interface Spark {
  x: number;
  y: number;
  ox: number;
  oy: number;
  born: number;
  group: string;
  ch: string;
  color: string;
}

/** How fast a letter rises (game pixels a second), letters a second, and how long a whole word holds once its last letter is off before it fades (seconds). Rise / rate is the spacing in the column: a letter's height and a pixel. */
const RISE = 13;
const RATE = 2.2;
const HOLD = 0.7;
const FADE = 0.5;

/**
 * LETTERS RISING OFF WHAT CARRIES A WORD: each emitter spells its word, a letter at a time, in order,
 * so that they rise in a column that reads from the top down; once the last letter is off the whole
 * word holds a moment and fades together, so that only the whole word is ever read (never part of
 * it), then after a pause it is spelled again.
 */
export class LetterSparks {
  private sparks: Spark[] = [];
  private next = new Map<string, { k: number; due: number }>();
  private ends = new Map<string, number>();

  /** Let the emitter `key` give off its next letter when it is due, from the world point (x, y) and the screen offset (ox, oy) from it. */
  emit(key: string, x: number, y: number, ox: number, oy: number, w: WordId, now: number): void {
    const e = this.next.get(key) ?? { k: 0, due: now };
    if (now >= e.due) {
      const text = wordText(w);
      const cycle = Math.floor(e.k / text.length);
      const i = e.k % text.length;
      const group = `${key}:${cycle}`;
      this.sparks.push({ x, y, ox, oy, born: now, group, ch: text[i], color: WORD_COLOR[w] });
      e.k++;
      if (i === text.length - 1) {
        this.ends.set(group, now + HOLD);
        // (the next spelling starts once this one has gone)
        e.due = now + HOLD + FADE + 1.2;
      } else e.due = now + 1 / RATE;
    }
    this.next.set(key, e);
  }

  draw(g: CanvasRenderingContext2D, at: ToScreen, now: number): void {
    this.sparks = this.sparks.filter((s) => {
      const end = this.ends.get(s.group);
      return now - s.born < 8 && (end === undefined || now < end + FADE);
    });
    for (const s of this.sparks) {
      const age = now - s.born;
      const end = this.ends.get(s.group);
      const out = end === undefined ? 1 : Math.max(0, Math.min(1, 1 - (now - end) / FADE));
      g.globalAlpha = Math.min(1, age / 0.15) * out;
      const [sx, sy] = at(s.x, s.y);
      drawText(g, s.ch, Math.round(sx + s.ox), Math.round(sy + s.oy - RISE * age), s.color, { font: 'small', align: 'center' });
    }
    g.globalAlpha = 1;
    for (const [k, end] of this.ends) if (now > end + FADE) this.ends.delete(k);
  }

  clear(): void {
    this.sparks.length = 0;
    this.next.clear();
    this.ends.clear();
  }
}
