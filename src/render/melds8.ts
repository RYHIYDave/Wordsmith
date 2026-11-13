// THE EIGHT MELDS ACROSS THE GROUPS: HOW THEY LOOK. Siphon, Cauterize, Forking, Shiver, Sunder, Fervor, Rime Ward and Implode,
// his picks of 8 Nov 2026 (“Yes, draft 6–8 (Recommended)”; of the eight drafted he took all eight). Their rules are the main
// chat's, on its branch melds8 (game/melds8.ts, behind MELDS8, off); this is how each LOOKS: its rune stone, its colours, and its
// moment at work. The queue's item, the art chat's (10 Nov): “Each needs a rune, its colours and how it looks at work. He sees
// stills, then a film, before they go live.”
//
// A mock-up of the art chat's, behind MELDS8_LOOK, which is OFF: with it off nothing here is drawn, lit, ticked or read, and the
// game is as it was. Drawn as the other melds were (render/melds3.ts, render/volatile3.ts): a ramp and a rune for each, cut in the
// stone as the others are (art/icons.ts runeSprite: the two words' colours along its foot, where they were fused; main.ts gives
// the game these with useMeldArt(art, M8_RAMP, M8_GLYPH, MELD8_IDS) once the eight are among the game's words).

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { P } from '../art/palette';
import { Px, drawGlow } from '../engine/px';
import type { Game } from '../game/game';
import type { Monster } from '../game/state';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/** The switch. Off: nothing here is drawn, lit, ticked or read, and the game is as it was. */
// ON with their rules (game/melds8.ts MELDS8), Version 25.3.17: his “Yes, hand them to main (Recommended)”, 12 Nov 2026.
export const MELDS8_LOOK = { on: true };

export const M8_IDS = ['siphon', 'cauterize', 'forking', 'shiver', 'sunder', 'fervor', 'rimeward', 'implode'] as const;
export type M8Id = (typeof M8_IDS)[number];

/** Each one's name, and its two words (the rules' MELD_OF, on the branch melds8: game/types.ts). */
export const M8_NAME: Record<M8Id, string> = { siphon: 'Siphon', cauterize: 'Cauterize', forking: 'Forking', shiver: 'Shiver', sunder: 'Sunder', fervor: 'Fervor', rimeward: 'Rime Ward', implode: 'Implode' };
export const M8_OF: Record<M8Id, readonly [string, string]> = {
  siphon: ['leech', 'poison'],
  cauterize: ['leech', 'fire'],
  forking: ['twin', 'lightning'],
  shiver: ['precise', 'frost'],
  sunder: ['heavy', 'power'],
  fervor: ['frenzied', 'fire'],
  rimeward: ['guarding', 'frost'],
  implode: ['pulling', 'volatile'],
};

/**
 * Each one's colours, darkest to brightest (the last its white-hot). Index 3 is the word's own colour, index 4 its glow, as
 * MELD_RAMP's are. Each looks like its two words and is told apart from every other: the game's 28 words, the ten melds,
 * Volatile's five, Binding, the friend's cyan and the enemy's pink and gold, at least 12 from each as the eye sees colour
 * (CIEDE2000, the check of words10's test; tools/melds8_palette.ts), and nothing of them cyan or pink. Two need a word: the
 * space round the warm colours is full (fire, Frenzied, Leech, Eruption, Powderkeg, Lasting), so Cauterize is a seared copper
 * darker than all of them and Fervor the peach-white of a fire burning hotter.
 */
export const M8_RAMP: Record<M8Id, readonly string[]> = {
  // a venom's green, drawn up as a leech's red
  siphon: ['#021404', '#06300a', '#0a5a10', '#008c05', '#ff9a84', '#ffe4dc'],
  // charred flesh, a seared copper, the iron white-hot
  cauterize: ['#1a0c08', '#3e1c10', '#7a3c20', '#d08460', '#ffd0a0', '#fff6e4'],
  // the twins' sea-green in the dark, the fork of the bolt white
  forking: ['#0a2420', '#145040', '#40a080', '#f0ffc0', '#faffe6', '#ffffff'],
  // a cold steel-blue, a shiver's white
  shiver: ['#0c1020', '#1c2440', '#3c4c80', '#8c9cc8', '#dce4ff', '#ffffff'],
  // iron rusted red, its crack burning
  sunder: ['#140c0c', '#2e1a1a', '#583636', '#8c5f5f', '#ff6a50', '#ffd8c0'],
  // a fire burning hotter: red, orange, peach-white
  fervor: ['#2a0c04', '#6a2008', '#c84a14', '#fcb490', '#ffe0c8', '#ffffff'],
  // the guard's sea-green under rime, its frost white
  rimeward: ['#04140e', '#0a3024', '#0e5640', '#0f825a', '#c8f0e0', '#ffffff'],
  // a void's violet, drawn into a point of white
  implode: ['#0c0220', '#24064e', '#460aa0', '#7800f0', '#d0b0ff', '#ffffff'],
};
export const M8_COLOR = Object.fromEntries(M8_IDS.map((w) => [w, M8_RAMP[w][3]])) as Record<M8Id, string>;
export const M8_GLOW = Object.fromEntries(M8_IDS.map((w) => [w, M8_RAMP[w][4]])) as Record<M8Id, string>;

/** Their runes, cut in the stone as the others are (art/icons.ts GLYPH): 7x7, 'X' the word's colour, 'o' its glowing core. */
export const M8_GLYPH: Record<M8Id, readonly string[]> = {
  siphon: ['.XXXXX.', 'X.ooo.X', '.X...X.', '..X.X..', '...o...', '..ooo..', '...o...'],
  cauterize: ['..o.o..', '...o...', '.XXXXX.', '.XoooX.', '.XXXXX.', '...X...', '...X...'],
  forking: ['...XX..', '..XX...', '.XXo...', '.X..X..', 'X....X.', 'X.....X', 'o.....o'],
  shiver: ['...X...', '.X...X.', '...o...', 'X.ooo.X', '...o...', '.X...X.', '...X...'],
  sunder: ['XXX.XXX', 'XXX.XXX', '.XXoXX.', '..XoX..', '.XXoXX.', 'XX.o.XX', 'XX...XX'],
  fervor: ['.....o.', '..o..X.', '..X.XX.', 'o.XXXX.', 'X.XXX..', 'XXXX...', '.XX....'],
  rimeward: ['XXXXXXX', 'X.o.o.X', 'X..o..X', 'X.o.o.X', '.X...X.', '..X.X..', '...X...'],
  implode: ['X.....X', '.X.X.X.', '..XXX..', '.XXoXX.', '..XXX..', '.X.X.X.', 'X.....X'],
};

/** What each rune is, for the pictures' labels. */
export const M8_GLYPH_IS: Record<M8Id, string> = {
  siphon: 'a drop of venom drawn up into a mouth',
  cauterize: 'a branding iron, red-hot, its flame',
  forking: 'a bolt forking in two, both ends lit',
  shiver: 'a cold star in the cross-hairs',
  sunder: 'a block of iron split, its crack burning',
  fervor: 'a fire climbing higher',
  rimeward: 'a shield, frost on its face',
  implode: 'everything drawn into one point',
};

/**
 * The rune stone of one of the eight, as the game cuts a melded word's (art/icons.ts runeSprite): the blank tablet, the rune
 * carved in it (its groove's top and left walls in shadow), its two words' colours along its foot. A Px, so that a picture can
 * be made of it away from a page; the game takes it as art/icons.ts does, `.outline(P.ink).sprite(6, 10)`.
 */
export function m8RunePx(word: M8Id, partColor: (w: string) => string): Px {
  return stonePx(M8_GLYPH[word], M8_COLOR[word], M8_GLOW[word], M8_OF[word].map(partColor) as [string, string]);
}

/** Any rune stone, cut as the game cuts them: for the pictures, the two words' own stones beside each meld's. */
export function stonePx(glyph: readonly string[], color: string, glow: string, foot?: readonly [string, string]): Px {
  const rows = [
    '............',
    '..11111111..',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '..33333333..',
    '............',
  ];
  const p = new Px(12, 12);
  const tone: Record<string, string> = { '1': P.st6, '2': P.st5, '3': P.st3 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => tone[ch] && p.set(x, y, tone[ch])));
  const n = glyph.length;
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < n && gx >= 0 && gx < n && glyph[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      if (!on(gx, gy)) continue;
      if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
      if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
    }
  }
  for (let gy = 0; gy < n; gy++) for (let gx = 0; gx < n; gx++) if (on(gx, gy)) p.set(3 + gx, 3 + gy, glyph[gy].charAt(gx) === 'o' ? glow : color);
  if (foot) {
    for (const x of [2, 3, 4]) p.set(x, 10, foot[0]);
    for (const x of [7, 8, 9]) p.set(x, 10, foot[1]);
  }
  return p.outline(P.ink);
}

// =====================================================================================================================================
// THEIR LOOKS AT WORK. Each is called up by the moment the rules say happened (an event `{ t: 'meld8', id, ... }`, below: the main
// chat's rules send them as they bring the eight in; the page tools/scenarios/melds8_looks.mjs sends them by hand), and drawn
// from where things are and the time since: the hero and the monsters are read from the game each frame, so a look follows what
// it is on. `k` is how strongly: 1 in front, the rules' MELD8_TUNE.behind (0.5) behind: behind's looks are smaller and fewer.
//
//   SIPHON     (each tick of his poison that heals him: `on` the poisoned one) venom squeezed out of it, beads of it drawn off in an arc
//              that turn from venom green to a leech's red as they fly, and a red pulse of life on him as they land.
//   CAUTERIZE  (a burning one killed: where, `x` `y`) a white-hot flash, its fire torn off it in a spiral and thrown at him as a
//              ribbon, and on him the brand: its rune stamped over him in fire, a ring of copper flame closing on him, steam hissing.
//   FORKING    (a hit's arc: from `x` `y` to `x1` `y1`) a jagged bolt jumping from the one struck to the other, forking near its end
//              (one prong to it, one to the floor), sparks at both ends, the twins' sea-green after-image left a moment.
//   SHIVER     (a critical hit that freezes: `on` the one frozen) cross-hairs snapping shut on it, a white crack of light, a star of
//              ice needles shooting out over the floor from its feet, shards thrown up, a shiver of cold lines and mist off it.
//   SUNDER     (`on` one stunned by a Sunder hit, for `secs`) the blow's dust ring, a crack split across the floor under it and up
//              its front, burning red, embers off it while the stun lasts; `what` 'hit': the crack flares and chips burst out.
//   FERVOR     (a kill: where, `x` `y`; `n` of `most` now, for `secs`) the kill's embers streaming to him, and flames round his feet
//              as long as it lasts, more and higher with each kill; at its most a burst of flame.
//   RIME WARD  (a blow he blocked: `on` its maker, chilled for `secs`) a pane of rime flashing up between them, cracking and blown
//              at it as shards, and rime crusting on it, cold mist trailing, while it is chilled.
//   IMPLODE    (a hit that will burst: at `x` `y`, pulling from `reach`, bursting `r` round after `wait`) a vortex on the floor, its
//              ring closing, everything near streaked toward its heart, a dark point swelling; then the burst: a white point, a
//              violet shock ring out to `r`, rays and shards, a star scorched on the floor.
// =====================================================================================================================================


/** The moment the rules send (the main chat's, once the eight are in: game.ts at each meld's moment). */
export interface M8Event {
  t: 'meld8';
  id: M8Id;
  /** sunder: 'hit', a blow on one already sundered; otherwise its moment. */
  what?: 'hit';
  /** How strongly: 1 in front, MELD8_TUNE.behind behind. */
  k?: number;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  /** The monster it is on (its id). */
  on?: number;
  n?: number;
  most?: number;
  secs?: number;
  reach?: number;
  r?: number;
  wait?: number;
}
export const isM8Event = (e: unknown): e is M8Event => !!e && (e as { t?: string }).t === 'meld8';

/** The looks' own numbers (how long each beat lasts, in seconds; how far, in tiles or the game's pixels). */
export const M8_LOOK = {
  siphon: { fly: 0.55, beads: 7, pulse: 0.5 },
  cauterize: { flash: 0.16, tear: 0.26, fly: 0.36, brand: 0.7, steam: 1.0 },
  forking: { bolt: 0.26, after: 0.3, prong: 0.6 },
  shiver: { close: 0.14, needles: 0.5, mist: 1.1, reach: 46 },
  sunder: { dust: 0.5, chips: 10, cool: 0.6 },
  fervor: { stream: 0.4, fade: 0.6, flare: 0.5 },
  rimeward: { pane: 0.32, shards: 0.3 },
  implode: { burst: 0.55, scorch: 1.4, rays: 10 },
} as const;

interface Bit {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  /** pull down, px/s² (0: floats) */
  fall: number;
  t: number;
  life: number;
  ramp: readonly string[];
  /** 'dot' a pixel or two; 'streak' a line back along its flight; 'puff' a soft blob that grows */
  kind: 'dot' | 'streak' | 'puff';
  size: number;
}
interface Beat {
  id: M8Id;
  what?: 'hit';
  t: number;
  k: number;
  seed: number;
  x: number;
  y: number;
  x1: number;
  y1: number;
  on: number;
  n: number;
  most: number;
  secs: number;
  reach: number;
  r: number;
  wait: number;
  /** for a look that follows its thing: where it was last seen */
  lx: number;
  ly: number;
  done: boolean;
}

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;
const clamp01 = (u: number): number => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u: number): number => 1 - (1 - clamp01(u)) ** 3;
/** A colour of a ramp by how hot (0 its darkest, 1 its white-hot). */
const tone = (ramp: readonly string[], hot: number): string => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(hot * (ramp.length - 1))))];

/** THE LOOKS. One for the game (render/fx.ts holds it, as it holds the uniques'); with MELDS8_LOOK off it takes nothing and draws nothing. */
export class M8Fx {
  game: Game | null = null;
  private beats: Beat[] = [];
  private bits: Bit[] = [];
  private t = 0;
  private seeds = 1;
  private rng = 12345;

  clear(): void {
    this.beats = [];
    this.bits = [];
  }

  private rand(): number {
    this.rng = (Math.imul(this.rng, 1664525) + 1013904223) | 0;
    return ((this.rng >>> 8) & 0xffffff) / 0x1000000;
  }

  /** The rules' moment (or the page's). Anything else is not ours. */
  handle(e: unknown): void {
    if (!MELDS8_LOOK.on || !isM8Event(e)) return;
    this.moment(e);
  }

  moment(e: M8Event): void {
    if (!MELDS8_LOOK.on) return;
    const game = this.game;
    const m = e.on !== undefined && game ? game.monsters.find((q) => q.id === e.on) : undefined;
    const x = e.x ?? m?.x ?? game?.hero.x ?? 0;
    const y = e.y ?? m?.y ?? game?.hero.y ?? 0;
    const b: Beat = {
      id: e.id, what: e.what, t: 0, k: e.k ?? 1, seed: this.seeds++, x, y, x1: e.x1 ?? x, y1: e.y1 ?? y, on: e.on ?? -1, n: e.n ?? 1, most: e.most ?? 5,
      secs: e.secs ?? 1, reach: e.reach ?? 3, r: e.r ?? 2.2, wait: e.wait ?? 0.4, lx: x, ly: y, done: false,
    };
    // (FERVOR: one look on him at a time, its count and time renewed by each kill; its stream from each kill its own)
    if (e.id === 'fervor') {
      const was = this.beats.find((q) => q.id === 'fervor' && !q.what && !q.done);
      if (was) {
        was.n = b.n;
        was.most = b.most;
        was.secs = b.secs;
        was.t = Math.min(was.t, M8_LOOK.fervor.stream);
        if (b.n >= b.most) was.what = undefined;
      }
      this.stream(b);
      if (was) {
        if (b.n >= b.most) this.flare(was);
        return;
      }
    }
    // (SUNDER and RIME WARD: one look on a monster at a time, renewed)
    if (e.id === 'sunder' && e.what === 'hit') {
      this.chips(b, m, 1);
      const on = this.beats.find((q) => q.id === 'sunder' && !q.what && q.on === b.on && !q.done);
      if (on) on.n = (on.n || 0) + 1;
      b.secs = 0.25;
    } else if ((e.id === 'sunder' || e.id === 'rimeward') && b.on >= 0) {
      for (const q of this.beats) if (q.id === e.id && q.on === b.on && !q.what) q.done = true;
    }
    this.start(b, m);
    this.beats.push(b);
  }

  /** What each look throws out as it begins. */
  private start(b: Beat, m: Monster | undefined): void {
    const R = M8_RAMP[b.id];
    const k = b.k;
    const mid = this.mid(m);
    if (b.id === 'siphon') {
      // (venom squeezed out of it)
      for (let i = 0; i < Math.round(8 * k); i++) this.bit(b.x, b.y, mid, 'dot', [R[2], R[3], '#7ccc30'], 1.2, 0.45, 0, 26, 30);
    } else if (b.id === 'cauterize') {
      for (let i = 0; i < Math.round(22 * k); i++) this.bit(b.x, b.y, 12, 'streak', R, 3.2, 0.5, 120, 60, 70);
      for (let i = 0; i < Math.round(6 * k); i++) this.bit(b.x, b.y, 10, 'puff', ['#3a3438', '#5a5458', '#8a8488'], 0.4, 0.9, -8, 12, 14);
    } else if (b.id === 'forking') {
      for (const [px, py] of [[b.x, b.y], [b.x1, b.y1]]) for (let i = 0; i < Math.round(12 * k); i++) this.bit(px, py, 12, 'streak', R, 3.6, 0.3, 160, 40, 90);
    } else if (b.id === 'shiver') {
      for (let i = 0; i < Math.round(34 * k); i++) this.bit(b.x, b.y, mid, 'streak', ['#8c9cc8', '#dce4ff', '#ffffff'], 4, 0.7, 180, 50, 130);
    } else if (b.id === 'sunder' && !b.what) {
      for (let i = 0; i < Math.round(14 * k); i++) this.bit(b.x, b.y, 2, 'puff', ['#2a2228', '#4a4048', '#6a6068'], 1.6, 0.7, -6, 6, 10);
      this.chips(b, m, 1.4);
    } else if (b.id === 'fervor') {
      this.stream(b);
    } else if (b.id === 'implode') {
      // (dust lifted at its rim, to be dragged in)
      for (let i = 0; i < Math.round(18 * k); i++) {
        const a = this.rand() * Math.PI * 2;
        const rr = b.reach * (0.8 + 0.25 * this.rand());
        this.bits.push({ x: b.x + Math.cos(a) * rr, y: b.y + Math.sin(a) * rr, z: 1 + this.rand() * 6, vx: 0, vy: 0, vz: 0, fall: 0, t: 0, life: b.wait, ramp: [R[2], R[3], R[4]], kind: 'dot', size: 1 + (i % 3 === 0 ? 1 : 0) });
      }
    }
  }

  /** Throw out a bit: from (x, y) at `z` px up, `speed` tiles a second out, `life` seconds, `fall` px/s² down, rising at up to `up` px/s (from `upMin`). */
  private bit(x: number, y: number, z: number, kind: Bit['kind'], ramp: readonly string[], speed: number, life: number, fall: number, upMin: number, up: number): void {
    const a = this.rand() * Math.PI * 2;
    const s = speed * (0.35 + 0.65 * this.rand());
    this.bits.push({ x, y, z, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: upMin + (up - upMin) * this.rand(), fall, t: 0, life: life * (0.6 + 0.5 * this.rand()), ramp, kind, size: kind === 'puff' ? 2 + this.rand() * 3 : 1 });
  }

  /** SUNDER's chips of it, burning at their edges, thrown off its crack. */
  private chips(b: Beat, m: Monster | undefined, more: number): void {
    const R = M8_RAMP.sunder;
    const mid = this.mid(m);
    for (let i = 0; i < Math.round(M8_LOOK.sunder.chips * more * b.k); i++) this.bit(m?.x ?? b.x, m?.y ?? b.y, mid, 'streak', i % 3 ? [R[2], R[3], R[4]] : [R[4], R[5], '#ffffff'], 2.6, 0.55, 260, 40, 120);
  }

  /** FERVOR: the kill's embers streaming to him. */
  private stream(b: Beat): void {
    const R = M8_RAMP.fervor;
    for (let i = 0; i < 16; i++) this.bit(b.x, b.y, 10, 'dot', [R[2], R[3], R[4], R[5]], 1.4, 0.3, 0, 10, 40);
    this.beats.push({ ...b, what: 'hit', t: 0, seed: this.seeds++ });
  }

  /** FERVOR at its most: a burst of flame off him. */
  private flare(b: Beat): void {
    const game = this.game;
    if (!game) return;
    const R = M8_RAMP.fervor;
    for (let i = 0; i < 26; i++) this.bit(game.hero.x, game.hero.y, 8, 'streak', [R[2], R[3], R[4], R[5]], 3.4, 0.5, -30, 40, 120);
    b.n = b.most;
  }

  /** How high a monster's middle is, in the game's pixels. */
  private mid(m: Monster | undefined): number {
    if (!m) return 12;
    const f = FIGURE_SIZE[figureOf(m)];
    return f ? Math.round(f.top * 0.5) : 12;
  }

  private mon(id: number): Monster | undefined {
    return id >= 0 ? this.game?.monsters.find((q) => q.id === id) : undefined;
  }

  update(dt: number): void {
    if (!MELDS8_LOOK.on) return;
    this.t += dt;
    const game = this.game;
    for (const b of this.beats) {
      b.t += dt;
      const m = this.mon(b.on);
      if (m) {
        b.lx = m.x;
        b.ly = m.y;
      }
      const L = M8_LOOK;
      const end =
        b.id === 'siphon' ? L.siphon.fly + L.siphon.pulse
        : b.id === 'cauterize' ? L.cauterize.flash + L.cauterize.tear + L.cauterize.fly + L.cauterize.steam
        : b.id === 'forking' ? L.forking.bolt + L.forking.after
        : b.id === 'shiver' ? L.shiver.mist
        : b.id === 'sunder' ? (b.what ? b.secs : Math.max(L.sunder.dust, b.secs + L.sunder.cool))
        : b.id === 'fervor' ? (b.what ? L.fervor.stream : b.secs)
        : b.id === 'rimeward' ? Math.max(L.rimeward.pane + L.rimeward.shards, b.secs)
        : b.wait + L.implode.scorch;
      if (b.t >= end) b.done = true;
      // (a monster gone: what is on it ends)
      if ((b.id === 'sunder' || b.id === 'rimeward') && !b.what && m && m.dead) b.done = true;
      // (what each gives off as it goes)
      if (b.done || !game) continue;
      const R = M8_RAMP[b.id];
      if (b.id === 'sunder' && !b.what && b.t < b.secs && this.rand() < dt * 14 * b.k) this.bits.push({ x: b.lx + (this.rand() - 0.5) * 0.3, y: b.ly + (this.rand() - 0.5) * 0.3, z: 2 + this.rand() * this.mid(m) * 1.4, vx: 0, vy: 0, vz: 14 + this.rand() * 16, fall: -6, t: 0, life: 0.7, ramp: [R[4], R[5], R[4], R[3]], kind: 'dot', size: 1 });
      if (b.id === 'rimeward' && b.t > L.rimeward.pane && b.t < b.secs && this.rand() < dt * 10 * b.k) this.bits.push({ x: b.lx + (this.rand() - 0.5) * 0.5, y: b.ly + (this.rand() - 0.5) * 0.5, z: this.rand() * this.mid(m), vx: (this.rand() - 0.5) * 0.3, vy: (this.rand() - 0.5) * 0.3, vz: -4, fall: 0, t: 0, life: 1.0, ramp: ['#ffffff', R[4], '#e8f4f0'], kind: 'puff', size: 2 });
      if (b.id === 'shiver' && b.t < L.shiver.mist * 0.8 && this.rand() < dt * 16 * b.k) this.bits.push({ x: b.lx + (this.rand() - 0.5) * 0.5, y: b.ly + (this.rand() - 0.5) * 0.5, z: this.rand() * 10, vx: 0, vy: 0, vz: 10, fall: 0, t: 0, life: 0.8, ramp: ['#ffffff', R[4], R[3]], kind: 'puff', size: 2 });
      if (b.id === 'fervor' && !b.what) {
        const strong = b.n / Math.max(1, b.most);
        if (this.rand() < dt * (10 + 30 * strong)) this.bits.push({ x: game.hero.x + (this.rand() - 0.5) * 0.7, y: game.hero.y + (this.rand() - 0.5) * 0.7, z: 2 + this.rand() * 8, vx: 0, vy: 0, vz: 30 + this.rand() * 40 * (0.5 + strong), fall: -10, t: 0, life: 0.6 + 0.4 * strong, ramp: [R[5], R[4], R[3], R[2]], kind: 'dot', size: 1 });
      }
      if (b.id === 'cauterize') {
        const s0 = L.cauterize.flash + L.cauterize.tear + L.cauterize.fly;
        if (b.t > s0 && b.t < s0 + L.cauterize.steam * 0.7 && this.rand() < dt * 30 * b.k) this.bits.push({ x: game.hero.x + (this.rand() - 0.5) * 0.5, y: game.hero.y + (this.rand() - 0.5) * 0.5, z: 8 + this.rand() * 12, vx: (this.rand() - 0.5) * 0.4, vy: (this.rand() - 0.5) * 0.4, vz: 26 + this.rand() * 20, fall: 0, t: 0, life: 0.7, ramp: ['#ffffff', '#f0ece8', '#c8c4c8', '#8a8690'], kind: 'puff', size: 2 });
      }
      if (b.id === 'implode' && b.t >= b.wait && !b.what) {
        b.what = 'hit';
        for (let i = 0; i < Math.round(30 * b.k); i++) this.bit(b.x, b.y, 6, 'streak', [R[3], R[4], R[5], '#ffffff'], 5 * (b.r / 2.2), 0.5, 140, 30, 140);
        for (let i = 0; i < Math.round(10 * b.k); i++) this.bit(b.x, b.y, 4, 'puff', [R[1], R[2], R[3]], 1.4, 0.9, -10, 10, 20);
      }
    }
    this.beats = this.beats.filter((b) => !b.done);
    // (IMPLODE: what it lifted is drawn to its heart)
    for (const p of this.bits) {
      p.t += dt;
      const pull = this.beats.find((b) => b.id === 'implode' && !b.what && Math.hypot(p.x - b.x, p.y - b.y) < b.reach * 1.2 + 0.1 && p.vz === 0 && p.fall === 0);
      if (pull) {
        const left = Math.max(0.02, pull.wait - pull.t);
        p.vx = (pull.x - p.x) / left;
        p.vy = (pull.y - p.y) / left;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z = Math.max(0, p.z + p.vz * dt);
      p.vz -= p.fall * dt;
      if (p.kind !== 'puff') {
        p.vx *= 1 - Math.min(1, dt * 2.2);
        p.vy *= 1 - Math.min(1, dt * 2.2);
      }
      if (p.z <= 0 && p.fall > 0) p.vz = 0;
    }
    this.bits = this.bits.filter((p) => p.t < p.life);
    if (this.bits.length > 900) this.bits.splice(0, this.bits.length - 900);
  }

  // ----------------------------------------------------------------------------------------------------------------------------------
  // drawing

  /** On the floor, under the characters: Sunder's crack, Shiver's star of needles, Implode's vortex and scorch, rings. */
  drawGround(g: CanvasRenderingContext2D, cam: Cam): void {
    if (!MELDS8_LOOK.on || !this.game) return;
    for (const b of this.beats) {
      if (b.id === 'sunder' && !b.what) this.sunderFloor(g, cam, b);
      else if (b.id === 'shiver') this.shiverFloor(g, cam, b);
      else if (b.id === 'implode') this.implodeFloor(g, cam, b);
      else if (b.id === 'fervor' && !b.what) this.fervorFloor(g, cam, b);
      else if (b.id === 'cauterize') this.cauterizeFloor(g, cam, b);
    }
    g.globalAlpha = 1;
  }

  /** In the air, over the characters and the dark: everything else, and every bit thrown. */
  drawAir(g: CanvasRenderingContext2D, cam: Cam): void {
    if (!MELDS8_LOOK.on || !this.game) return;
    for (const b of this.beats) {
      if (b.id === 'siphon') this.siphonAir(g, cam, b);
      else if (b.id === 'cauterize') this.cauterizeAir(g, cam, b);
      else if (b.id === 'forking') this.forkingAir(g, cam, b);
      else if (b.id === 'shiver') this.shiverAir(g, cam, b);
      else if (b.id === 'sunder') this.sunderAir(g, cam, b);
      else if (b.id === 'fervor') this.fervorAir(g, cam, b);
      else if (b.id === 'rimeward') this.rimeAir(g, cam, b);
      else if (b.id === 'implode') this.implodeAir(g, cam, b);
    }
    for (const p of this.bits) this.drawBit(g, cam, p);
    g.globalAlpha = 1;
  }

  private drawBit(g: CanvasRenderingContext2D, cam: Cam, p: Bit): void {
    const u = p.t / p.life;
    const sx = Math.round(wx(cam, p.x, p.y));
    const sy = Math.round(wy(cam, p.x, p.y) - p.z);
    // (hottest as it is thrown, cooling as it goes)
    const c = tone(p.ramp, 1 - u);
    if (p.kind === 'puff') {
      const s = Math.round(p.size + u * 4);
      g.globalAlpha = 0.5 * (1 - u);
      g.fillStyle = c;
      g.fillRect(sx - s, sy - Math.round(s * 0.7), s * 2, Math.round(s * 1.4));
      g.globalAlpha = 1;
      return;
    }
    g.globalAlpha = u < 0.75 ? 1 : (1 - u) / 0.25;
    g.fillStyle = c;
    if (p.kind === 'streak') {
      const bx = (p.vx - p.vy) * 16 * 0.035;
      const by = (p.vx + p.vy) * 8 * 0.035 - p.vz * 0.035;
      const n = Math.max(1, Math.min(6, Math.round(Math.hypot(bx, by))));
      for (let i = 0; i <= n; i++) g.fillRect(Math.round(sx - (bx * i) / n), Math.round(sy - (by * i) / n), 1, 1);
      g.fillStyle = tone(p.ramp, 1);
      g.fillRect(sx, sy, 1, 1);
    } else g.fillRect(sx, sy, p.size, p.size);
    g.globalAlpha = 1;
  }

  /** A pixel line from (x0, y0) to (x1, y1) on the screen. */
  private line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w = 1): void {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    const o = Math.floor((w - 1) / 2);
    for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + ((x1 - x0) * i) / n) - o, Math.round(y0 + ((y1 - y0) * i) / n) - o, w, w);
  }

  /** A ring on the floor round (x, y), `rt` tiles, drawn in pixels; `gap` leaves every so many out. */
  private ring(g: CanvasRenderingContext2D, cam: Cam, x: number, y: number, rt: number, gap = 0, spin = 0, lift = 0): void {
    const cx = wx(cam, x, y);
    const cy = wy(cam, x, y) - lift;
    const rx = rt * 22.6;
    const n = Math.max(12, Math.round(rx * 1.6));
    for (let i = 0; i < n; i++) {
      if (gap && i % gap === 0) continue;
      const a = (i / n) * Math.PI * 2 + spin;
      g.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * rx * 0.5), 1, 1);
    }
  }

  // ---- SIPHON
  private siphonAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const game = this.game!;
    const R = M8_RAMP.siphon;
    const L = M8_LOOK.siphon;
    const m = this.mon(b.on);
    const z0 = this.mid(m);
    const ax = wx(cam, b.lx, b.ly);
    const ay = wy(cam, b.lx, b.ly) - z0;
    const hx = wx(cam, game.hero.x, game.hero.y);
    const hy = wy(cam, game.hero.x, game.hero.y) - 14;
    // (the arc: up out of it and over to him)
    const lift = 14 + Math.hypot(hx - ax, hy - ay) * 0.25;
    const at = (u: number): [number, number] => [lerp(ax, hx, u), lerp(ay, hy, u) - Math.sin(u * Math.PI) * lift];
    const n = Math.max(2, Math.round(L.beads * b.k));
    // (the draw itself: a thin thread flickering between them while the beads fly)
    if (b.t < L.fly) {
      // (two strands twisting round each other, venom green turning red along the way)
      const f = 1 - b.t / L.fly;
      for (let strand = 0; strand < 2; strand++) {
        for (let i = 0; i < 48; i++) {
          const u = i / 48;
          const [px, py] = at(u);
          const tw = Math.sin(u * 14 - this.t * 18 + strand * Math.PI) * 3 * Math.sin(u * Math.PI);
          g.globalAlpha = 0.75 * f;
          g.fillStyle = u < 0.45 ? R[3] : u < 0.6 ? '#b8ff70' : R[4];
          g.fillRect(Math.round(px), Math.round(py + tw), 1, 2);
        }
      }
      // (it, squeezed: venom welling on it, dripping)
      drawGlow(g, ax, ay, 24 * b.k, R[3], 0.55 * f);
      g.globalAlpha = f;
      g.fillStyle = R[3];
      this.ring(g, cam, b.lx, b.ly, 0.35 + 0.25 * ease(b.t / L.fly), 2, this.t * 4);
    }
    for (let i = 0; i < n; i++) {
      const u = (b.t - i * 0.05) / (L.fly - (n - 1) * 0.05);
      if (u <= 0 || u >= 1) continue;
      const e = u * u * (3 - 2 * u);
      // (venom's green turning to a leech's red as it flies)
      const red = clamp01((e - 0.35) / 0.3);
      for (let j = 6; j >= 0; j--) {
        const [px, py] = at(Math.max(0, e - j * 0.025));
        g.globalAlpha = 1 - j * 0.13;
        g.fillStyle = red > 0.5 ? (j < 2 ? R[4] : R[3]) : j < 2 ? '#b8ff70' : R[3];
        const s = j === 0 ? 4 : j < 3 ? 3 : 2;
        g.fillRect(Math.round(px - s / 2), Math.round(py - s / 2), s, s);
      }
      const [px, py] = at(e);
      g.globalAlpha = 1;
      g.fillStyle = red > 0.5 ? R[5] : '#eaffd0';
      g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 2, 2);
      drawGlow(g, px, py, 14, red > 0.5 ? R[4] : R[3], 0.6);
    }
    // (life on him, as they land)
    const p = (b.t - L.fly * 0.8) / L.pulse;
    if (p > 0 && p < 1) {
      g.globalAlpha = 1 - p;
      g.fillStyle = p < 0.3 ? R[5] : R[4];
      this.ring(g, cam, game.hero.x, game.hero.y, (0.3 + 0.8 * ease(p)) * (0.6 + 0.4 * b.k), 0, 0, 14 - 10 * p);
      this.ring(g, cam, game.hero.x, game.hero.y, (0.3 + 0.8 * ease(p)) * (0.6 + 0.4 * b.k) - 0.06, 2, 0, 14 - 10 * p);
      drawGlow(g, hx, hy, 34 * b.k, R[4], 0.7 * (1 - p));
      // (a plus of life over him)
      if (p < 0.6) {
        g.globalAlpha = 1 - p / 0.6;
        g.fillStyle = R[5];
        const top = Math.round(hy - 14 - p * 10);
        g.fillRect(Math.round(hx) - 2, top - 5, 5, 11);
        g.fillRect(Math.round(hx) - 5, top - 2, 11, 5);
        g.fillStyle = R[4];
        g.fillRect(Math.round(hx) - 1, top - 4, 3, 9);
        g.fillRect(Math.round(hx) - 4, top - 1, 9, 3);
      }
    }
    g.globalAlpha = 1;
  }

  // ---- CAUTERIZE
  private cauterizeFloor(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const L = M8_LOOK.cauterize;
    const R = M8_RAMP.cauterize;
    // (where it burned: a scorch on the floor, cooling)
    const u = b.t / (L.flash + L.tear + L.fly + L.steam);
    g.globalAlpha = 0.7 * (1 - u);
    g.fillStyle = u < 0.3 ? R[3] : R[1];
    this.ring(g, cam, b.x, b.y, 0.35 + 0.2 * ease(b.t / 0.3), 3);
    g.fillStyle = R[0];
    g.globalAlpha = 0.5 * (1 - u);
    this.ring(g, cam, b.x, b.y, 0.22);
    // (the brand's ring closing on him)
    const s0 = L.flash + L.tear + L.fly;
    const p = (b.t - s0) / L.brand;
    if (p > 0 && p < 1) {
      const game = this.game!;
      g.globalAlpha = 1 - p * 0.6;
      g.fillStyle = p < 0.5 ? R[4] : R[3];
      for (const dr of [0, 0.05, 0.1]) this.ring(g, cam, game.hero.x, game.hero.y, lerp(1.5, 0.3, ease(p)) * (0.6 + 0.4 * b.k) - dr);
      g.fillStyle = R[5];
      this.ring(g, cam, game.hero.x, game.hero.y, lerp(1.5, 0.3, ease(p)) * (0.6 + 0.4 * b.k), 4, this.t * 3);
    }
    g.globalAlpha = 1;
  }

  private cauterizeAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const game = this.game!;
    const L = M8_LOOK.cauterize;
    const R = M8_RAMP.cauterize;
    const ax = wx(cam, b.x, b.y);
    const ay = wy(cam, b.x, b.y) - 12;
    const hx = wx(cam, game.hero.x, game.hero.y);
    const hy = wy(cam, game.hero.x, game.hero.y) - 14;
    // (1: the white-hot flash where it fell)
    if (b.t < L.flash + 0.1) {
      const u = b.t / (L.flash + 0.1);
      drawGlow(g, ax, ay, 44 * b.k, '#fff6e4', 0.9 * (1 - u));
      drawGlow(g, ax, ay, 28 * b.k, R[4], 0.8 * (1 - u));
      // (a pillar of fire up off it)
      const tall = Math.round(46 * b.k * (1 - u * 0.5));
      for (let k2 = 0; k2 < tall; k2++) {
        const v = k2 / tall;
        const w = Math.max(1, Math.round((1 - v) * 9 * (1 - u)));
        g.globalAlpha = (1 - v) * (1 - u);
        g.fillStyle = v < 0.2 ? '#ffffff' : v < 0.5 ? R[5] : v < 0.8 ? R[4] : R[3];
        g.fillRect(Math.round(ax - w / 2 + Math.sin(v * 9 + this.t * 20) * 2 * v), Math.round(ay + 10 - k2), w, 1);
      }
      g.globalAlpha = 1;
    }
    // (2: its fire torn off it, turning round it and drawn in)
    const t2 = b.t - L.flash;
    const tongues = Math.round(16 * b.k);
    if (t2 > -0.06 && t2 < L.tear + L.fly) {
      for (let i = 0; i < tongues; i++) {
        const a0 = (i / tongues) * Math.PI * 2;
        const tear = clamp01(t2 / L.tear);
        const fly = clamp01((t2 - L.tear - (i % 4) * 0.02) / (L.fly - 0.06));
        // (spiralling in round it, then thrown along an arc at him)
        const a = a0 + tear * 4;
        const rr = (1 - tear) * 16 + 3;
        const sx0 = ax + Math.cos(a) * rr;
        const sy0 = ay + Math.sin(a) * rr * 0.6 - tear * 6;
        const e = fly * fly;
        const px = lerp(sx0, hx, e);
        const py = lerp(sy0, hy, e) - Math.sin(e * Math.PI) * 36;
        if (fly >= 1) continue;
        for (let j = 6; j >= 0; j--) {
          g.globalAlpha = (1 - j * 0.12) * (fly > 0.85 ? (1 - fly) / 0.15 : 1);
          g.fillStyle = tone(R, 1 - j * 0.1 - (fly > 0 ? 0 : 0.15));
          const e2 = Math.max(0, e - j * 0.035);
          const qx = fly > 0 ? lerp(sx0, hx, e2) : px - Math.cos(a) * j * 2;
          const qy = fly > 0 ? lerp(sy0, hy, e2) - Math.sin(e2 * Math.PI) * 36 : py - Math.sin(a) * j;
          const s = j === 0 ? 3 : j < 3 ? 2 : 1;
          g.fillRect(Math.round(qx - s / 2), Math.round(qy - s / 2), s, s);
        }
        drawGlow(g, px, py, 10, R[4], 0.35);
      }
      g.globalAlpha = 1;
    }
    // (3: the brand on him: its rune stamped over him in fire, flaring and fading)
    const s0 = L.flash + L.tear + L.fly;
    const p = (b.t - s0) / L.brand;
    if (p > -0.02 && p < 1) {
      const q = clamp01(p);
      drawGlow(g, hx, hy, 44 * b.k, R[4], 0.9 * (1 - q));
      if (q < 0.2) drawGlow(g, hx, hy, 30, '#ffffff', 0.8 * (1 - q / 0.2));
      const glyph = M8_GLYPH.cauterize;
      const sc = q < 0.1 ? 4 : 3;
      const ox = Math.round(hx - (7 * sc) / 2);
      const oy = Math.round(hy - 6 - (7 * sc) / 2 - q * 6);
      g.globalAlpha = q < 0.6 ? 1 : (1 - q) / 0.4;
      for (let gy = 0; gy < 7; gy++) {
        for (let gx = 0; gx < 7; gx++) {
          const ch = glyph[gy].charAt(gx);
          if (ch === '.') continue;
          g.fillStyle = q < 0.15 ? '#ffffff' : ch === 'o' ? R[5] : R[4];
          g.fillRect(ox + gx * sc, oy + gy * sc, sc, sc);
        }
      }
      if (p > 0 && p < 0.05 && !b.what) {
        b.what = 'hit';
        for (let i = 0; i < Math.round(24 * b.k); i++) this.bit(game.hero.x, game.hero.y, 14, 'streak', R, 3, 0.45, 100, 30, 90);
      }
    }
    g.globalAlpha = 1;
  }

  // ---- FORKING
  private forkingAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const L = M8_LOOK.forking;
    const R = M8_RAMP.forking;
    const ax = wx(cam, b.x, b.y);
    const ay = wy(cam, b.x, b.y) - 12;
    const bx = wx(cam, b.x1, b.y1);
    const by = wy(cam, b.x1, b.y1) - 12;
    const live = b.t < L.bolt;
    const after = !live && b.t < L.bolt + L.after;
    if (!live && !after) return;
    // (the path: jagged, made anew every other frame while it lives, its last kept for the after-image)
    const frame = live ? Math.floor(b.t * 15) : Math.floor(L.bolt * 15) - 1;
    const seg = 9;
    const path: [number, number][] = [];
    const len = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / (len || 1);
    const ny = (bx - ax) / (len || 1);
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      const j = i === 0 || i === seg ? 0 : ((hash(b.seed, frame * 31 + i) % 2001) / 1000 - 1) * (6 + len * 0.05);
      path.push([ax + (bx - ax) * u + nx * j, ay + (by - ay) * u + ny * j - Math.sin(u * Math.PI) * 10]);
    }
    // (its fork: off two-thirds of the way, down to the floor short of the other)
    const fi = Math.round(seg * 0.62);
    const [fx0, fy0] = path[fi];
    const fx1 = lerp(ax, bx, 0.86) + nx * 14;
    const fy1 = lerp(ay, by, 0.86) + ny * 14 + 14;
    const prong: [number, number][] = [[fx0, fy0]];
    for (let i = 1; i <= 4; i++) {
      const u = i / 4;
      const j = i === 4 ? 0 : ((hash(b.seed + 7, frame * 17 + i) % 2001) / 1000 - 1) * 5;
      prong.push([lerp(fx0, fx1, u) + j, lerp(fy0, fy1, u) - j * 0.4]);
    }
    const draw = (pts: [number, number][], w: number, col: string, core: string | null): void => {
      for (let i = 0; i < pts.length - 1; i++) {
        g.fillStyle = col;
        this.line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w);
        if (core) {
          g.fillStyle = core;
          this.line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1);
        }
      }
    };
    if (live) {
      // (it reaches across in the first two frames, then holds, flickering)
      const reach = clamp01(b.t / 0.06);
      const shown = path.slice(0, Math.max(2, Math.round(reach * path.length)));
      g.globalAlpha = 0.3;
      draw(shown, 9, R[2], null);
      g.globalAlpha = 0.55;
      draw(shown, 5, R[3], null);
      g.globalAlpha = Math.floor(b.t * 30) % 3 === 2 ? 0.7 : 1;
      draw(shown, 3, R[4], '#ffffff');
      if (reach >= 1) {
        g.globalAlpha = 0.9;
        draw(prong, 3, R[3], R[5]);
        drawGlow(g, fx1, fy1, 20, R[4], 0.7);
      }
      for (const [px, py] of shown) drawGlow(g, px, py, 16 * b.k, R[3], 0.25);
      drawGlow(g, ax, ay, 26 * b.k, R[4], 0.55);
      if (reach >= 1) drawGlow(g, bx, by, 30 * b.k, '#ffffff', 0.6 * (1 - b.t / L.bolt));
    } else {
      // (the twins' sea-green after-image, fading)
      const u = (b.t - L.bolt) / L.after;
      g.globalAlpha = 0.6 * (1 - u);
      draw(path, 1, R[2], null);
      g.globalAlpha = 0.35 * (1 - u);
      draw(prong, 1, R[1], null);
    }
    g.globalAlpha = 1;
  }

  // ---- SHIVER
  private shiverFloor(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const L = M8_LOOK.shiver;
    const R = M8_RAMP.shiver;
    const cx = wx(cam, b.lx, b.ly);
    const cy = wy(cam, b.lx, b.ly);
    const t = b.t - L.close;
    if (t < 0) return;
    const grow = ease(t / 0.18);
    const fade = clamp01((L.mist - b.t) / 0.4);
    // (a star of ice needles shot out over the floor from its feet, crystals standing along them)
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (b.seed % 7) * 0.2;
      const len = L.reach * (i % 2 ? 0.65 : 1) * (0.6 + 0.4 * b.k) * grow;
      const ex = cx + Math.cos(a) * len;
      const ey = cy + Math.sin(a) * len * 0.5;
      g.globalAlpha = 0.9 * fade;
      g.fillStyle = R[2];
      this.line(g, cx, cy + 1, ex, ey + 1, 3);
      g.fillStyle = R[4];
      this.line(g, cx, cy, ex, ey, 2);
      g.fillStyle = R[5];
      this.line(g, cx, cy, ex, ey, 1);
      // (crystals up off it)
      for (let s = 1; s <= 3; s++) {
        const u = s / 4;
        const px = Math.round(lerp(cx, ex, u));
        const py = Math.round(lerp(cy, ey, u));
        const h = Math.round((4 - s) * 4 * grow);
        g.fillStyle = R[3];
        g.fillRect(px - 1, py - h + 2, 3, h - 2);
        g.fillStyle = R[4];
        g.fillRect(px, py - h, 1, h);
        g.fillStyle = '#ffffff';
        g.fillRect(px, py - h, 1, 1);
      }
    }
    g.globalAlpha = 0.5 * fade;
    g.fillStyle = R[2];
    this.ring(g, cam, b.lx, b.ly, 0.5 * grow, 2);
    g.globalAlpha = 1;
  }

  private shiverAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const L = M8_LOOK.shiver;
    const R = M8_RAMP.shiver;
    const m = this.mon(b.on);
    const z = this.mid(m);
    const cx = Math.round(wx(cam, b.lx, b.ly));
    const cy = Math.round(wy(cam, b.lx, b.ly) - z);
    // (1: the cross-hairs closing on it, then snapping)
    if (b.t < L.close + 0.1) {
      const u = clamp01(b.t / L.close);
      const r = Math.round(lerp(30, 7, ease(u)) * (0.6 + 0.4 * b.k));
      g.globalAlpha = 1;
      g.fillStyle = u < 1 ? '#ffffff' : R[4];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const px = cx + dx * r;
        const py = cy + dy * r;
        g.fillRect(px - (dy ? 1 : dx > 0 ? 0 : 6), py - (dx ? 1 : dy > 0 ? 0 : 6), dy ? 2 : 7, dx ? 2 : 7);
      }
      // (the corners of its frame)
      g.fillStyle = R[3];
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        g.fillRect(cx + dx * r - (dx < 0 ? 0 : 2), cy + dy * r, 3, 1);
        g.fillRect(cx + dx * r, cy + dy * r - (dy < 0 ? 0 : 2), 1, 3);
      }
    }
    // (2: the white crack of light as it freezes)
    const f = b.t - L.close;
    if (f > 0 && f < 0.3) {
      const u = f / 0.3;
      drawGlow(g, cx, cy, 48 * b.k, '#ffffff', 0.9 * (1 - u));
      drawGlow(g, cx, cy, 32 * b.k, R[4], 0.7 * (1 - u));
      // (a cross of light, its long arms flat)
      g.globalAlpha = 1 - u;
      g.fillStyle = '#ffffff';
      const w = Math.round(lerp(40, 10, u) * b.k);
      g.fillRect(cx - w, cy - 1, w * 2 + 1, 3);
      g.fillRect(cx - 1, cy - Math.round(w * 0.6), 3, Math.round(w * 1.2) + 1);
    }
    // (3: a shiver: short cold lines either side of it, trembling)
    if (f > 0.05 && f < 0.7) {
      const u = (f - 0.05) / 0.65;
      g.globalAlpha = 0.9 * (1 - u);
      g.fillStyle = R[4];
      const j = Math.floor(this.t * 30) % 2;
      for (let i = 0; i < 3; i++) {
        const yy = cy - 6 + i * 6 + j;
        g.fillRect(cx - 12 - i * 2 - j, yy, 3, 1);
        g.fillRect(cx + 10 + i * 2 + j, yy, 3, 1);
      }
    }
    g.globalAlpha = 1;
  }

  // ---- SUNDER
  private crack(b: Beat): [number, number][] {
    // (a crack's path in the floor: across the tile it stands on, with a turn or two; tiles from its feet)
    const pts: [number, number][] = [];
    const a = ((b.seed * 37) % 100) / 100 * Math.PI;
    for (let i = -4; i <= 4; i++) {
      const u = i / 4;
      const j = i === 0 ? 0 : ((hash(b.seed, i + 9) % 1001) / 1000 - 0.5) * 0.18;
      pts.push([Math.cos(a) * u * 1.4 - Math.sin(a) * j, Math.sin(a) * u * 1.4 + Math.cos(a) * j]);
    }
    return pts;
  }

  private sunderFloor(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const L = M8_LOOK.sunder;
    const R = M8_RAMP.sunder;
    // (the blow's dust ring)
    if (b.t < L.dust) {
      const u = b.t / L.dust;
      g.globalAlpha = 0.8 * (1 - u);
      g.fillStyle = '#6a6068';
      for (const dr of [0, 0.06]) this.ring(g, cam, b.lx, b.ly, 0.3 + 1.4 * ease(u) * (0.6 + 0.4 * b.k) - dr, 3);
    }
    // (the crack: cut open, burning, cooling once the stun is over)
    const open = ease(b.t / 0.12);
    const cool = b.t < b.secs ? 1 : clamp01(1 - (b.t - b.secs) / L.cool);
    const pts = this.crack(b);
    const beat = 0.75 + 0.25 * Math.sin(this.t * 9 + b.seed);
    const shown = Math.max(2, Math.round(open * pts.length));
    const mid = Math.floor(pts.length / 2);
    const from = Math.max(0, mid - Math.ceil(shown / 2));
    const to = Math.min(pts.length - 1, mid + Math.ceil(shown / 2));
    for (let i = from; i < to; i++) {
      const x0 = wx(cam, b.lx + pts[i][0], b.ly + pts[i][1]);
      const y0 = wy(cam, b.lx + pts[i][0], b.ly + pts[i][1]);
      const x1 = wx(cam, b.lx + pts[i + 1][0], b.ly + pts[i + 1][1]);
      const y1 = wy(cam, b.lx + pts[i + 1][0], b.ly + pts[i + 1][1]);
      g.globalAlpha = cool;
      g.fillStyle = R[0];
      this.line(g, x0, y0 + 1, x1, y1 + 1, 5);
      g.globalAlpha = cool * beat;
      g.fillStyle = R[4];
      this.line(g, x0, y0, x1, y1, 3);
      g.fillStyle = b.t < 0.15 ? '#ffffff' : R[5];
      this.line(g, x0, y0, x1, y1, 1);
    }
    g.globalAlpha = 1;
  }

  private sunderAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const R = M8_RAMP.sunder;
    const m = this.mon(b.on);
    const top = m ? FIGURE_SIZE[figureOf(m)]?.top ?? 24 : 24;
    const cx = Math.round(wx(cam, b.lx, b.ly));
    const cy = Math.round(wy(cam, b.lx, b.ly));
    if (b.what) {
      // (a blow on one sundered: its crack flaring white)
      const u = b.t / b.secs;
      drawGlow(g, cx, cy - top * 0.5, 30 * b.k, R[5], 0.8 * (1 - u));
      drawGlow(g, cx, cy - top * 0.5, 18 * b.k, R[4], 0.7 * (1 - u));
      return;
    }
    // (the crack up its front, as long as it is stunned: a zigzag of burning red from its feet to its head, flaring at the first)
    const cool = b.t < b.secs ? 1 : clamp01(1 - (b.t - b.secs) / M8_LOOK.sunder.cool);
    const open = ease(b.t / 0.16);
    const hot = 0.75 + 0.25 * Math.sin(this.t * 9 + b.seed) + (b.n > 0 ? 0 : 0);
    const steps = Math.max(2, Math.round((top * 0.85 * open) / 3));
    let px = cx;
    let py = cy - 1;
    g.globalAlpha = cool * hot;
    for (let i = 0; i < steps; i++) {
      const nx = cx + (((hash(b.seed, i) % 5) - 2) * (i % 2 ? 1 : -1));
      const ny = py - 3;
      g.fillStyle = R[4];
      this.line(g, px, py, nx, ny, 3);
      g.fillStyle = b.t < 0.15 ? '#ffffff' : R[5];
      this.line(g, px, py, nx, ny, 1);
      if (i % 3 === 1) {
        g.fillStyle = R[3];
        g.fillRect(nx + (i % 2 ? 1 : -2), ny, 2, 1);
      }
      px = nx;
      py = ny;
    }
    drawGlow(g, cx, cy - top * 0.45, 30 * b.k, R[4], 0.5 * cool * hot);
    if (b.t < 0.2) drawGlow(g, cx, cy - top * 0.5, 50 * b.k, R[5], 0.9 * (1 - b.t / 0.2));
    g.globalAlpha = 1;
  }

  // ---- FERVOR
  private fervorFloor(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const game = this.game!;
    const R = M8_RAMP.fervor;
    const strong = b.n / Math.max(1, b.most);
    const fade = clamp01((b.secs - b.t) / M8_LOOK.fervor.fade);
    // (a ring of heat on the floor round him, brighter with each kill)
    g.globalAlpha = (0.35 + 0.45 * strong) * fade;
    g.fillStyle = R[2];
    this.ring(g, cam, game.hero.x, game.hero.y, 0.55 + 0.15 * strong);
    g.fillStyle = R[3];
    this.ring(g, cam, game.hero.x, game.hero.y, 0.55 + 0.15 * strong, 3, this.t * 2);
    g.globalAlpha = 1;
  }

  private fervorAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const game = this.game!;
    const R = M8_RAMP.fervor;
    const hx = wx(cam, game.hero.x, game.hero.y);
    const hy = wy(cam, game.hero.x, game.hero.y);
    if (b.what) {
      // (a kill's embers, streaming to him along an arc)
      const L = M8_LOOK.fervor.stream;
      const ax = wx(cam, b.x, b.y);
      const ay = wy(cam, b.x, b.y) - 10;
      for (let i = 0; i < 10; i++) {
        const u = clamp01((b.t - i * 0.018) / (L - 0.18));
        if (u <= 0 || u >= 1) continue;
        const e = u * u;
        const sway = Math.sin(i * 1.7 + b.seed) * 8 * (1 - e);
        const px = lerp(ax, hx, e) + sway;
        const py = lerp(ay, hy - 12, e) - Math.sin(e * Math.PI) * 18;
        g.globalAlpha = 1;
        g.fillStyle = i % 3 ? R[4] : R[5];
        g.fillRect(Math.round(px), Math.round(py), 2, 2);
        g.fillStyle = R[3];
        g.fillRect(Math.round(px - (hx - ax) * 0.02), Math.round(py + 1), 1, 1);
      }
      return;
    }
    // (flames round his feet: more and higher with each kill, licking up, fading as it runs out)
    const strong = b.n / Math.max(1, b.most);
    const fade = clamp01((b.secs - b.t) / M8_LOOK.fervor.fade) * clamp01(b.t / 0.15);
    const n = 3 + 2 * Math.round(b.n);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + this.t * 1.3;
      const rx = 0.42 * 22.6;
      const fx = hx + Math.cos(a) * rx;
      const fy = hy + Math.sin(a) * rx * 0.5;
      // (behind him drawn lower, so he stands in it)
      const tall = (6 + 4 * strong * 2.5) * (0.75 + 0.25 * Math.sin(this.t * 13 + i * 2.1)) * fade;
      const lean = Math.sin(this.t * 7 + i) * 1.5;
      for (let k = 0; k < tall; k++) {
        const u = k / tall;
        const w = Math.max(1, Math.round((1 - u) * 3));
        g.globalAlpha = 1;
        g.fillStyle = u < 0.25 ? R[5] : u < 0.5 ? R[4] : u < 0.8 ? R[3] : R[2];
        g.fillRect(Math.round(fx - w / 2 + lean * u), Math.round(fy - k), w, 1);
      }
    }
    drawGlow(g, hx, hy - 8, (20 + 18 * strong) * fade, R[3], (0.25 + 0.35 * strong) * fade);
    g.globalAlpha = 1;
  }

  // ---- RIME WARD
  private rimeAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const game = this.game!;
    const L = M8_LOOK.rimeward;
    const R = M8_RAMP.rimeward;
    const m = this.mon(b.on);
    const z = this.mid(m);
    const hx = wx(cam, game.hero.x, game.hero.y);
    const hy = wy(cam, game.hero.x, game.hero.y) - 14;
    const mx = wx(cam, b.lx, b.ly);
    const my = wy(cam, b.lx, b.ly) - z;
    const dx = mx - hx;
    const dy = my - hy;
    const d = Math.hypot(dx, dy) || 1;
    // (1: the pane of rime between them, a little out from him toward it: a six-sided pane, cracking)
    if (b.t < L.pane) {
      const u = b.t / L.pane;
      const cx = hx + (dx / d) * 12;
      const cy = hy + (dy / d) * 12;
      const s = Math.round(lerp(5, 16, ease(u * 3)) * (0.6 + 0.4 * b.k));
      // (seen edge-on, as a pane standing up on the floor: narrow and tall)
      const side = (i: number): [number, number] => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return [cx + Math.cos(a) * s * 0.45, cy + Math.sin(a) * s];
      };
      g.globalAlpha = 0.35 * (1 - u);
      g.fillStyle = R[4];
      g.fillRect(Math.round(cx - s * 0.45), Math.round(cy - s), Math.round(s * 0.9), s * 2);
      g.globalAlpha = 1 - u * 0.5;
      g.fillStyle = u < 0.2 ? '#ffffff' : R[4];
      for (let i = 0; i < 6; i++) {
        const [x0, y0] = side(i);
        const [x1, y1] = side(i + 1);
        this.line(g, x0, y0, x1, y1, 1);
      }
      // (its cracks, spreading from where the blow struck)
      if (u > 0.3) {
        g.fillStyle = '#ffffff';
        const c = ease((u - 0.3) / 0.5);
        for (let i = 0; i < 4; i++) {
          const a = i * 1.6 + b.seed;
          this.line(g, cx, cy, cx + Math.cos(a) * s * 0.45 * c, cy + Math.sin(a) * s * c, 1);
        }
      }
      drawGlow(g, cx, cy, 22 * b.k, R[4], 0.5 * (1 - u));
    }
    // (2: blown at it as shards)
    const t2 = b.t - L.pane * 0.7;
    if (t2 > 0 && t2 < L.shards) {
      const u = t2 / L.shards;
      for (let i = 0; i < Math.round(14 * b.k); i++) {
        const spread = ((hash(b.seed, i) % 1001) / 1000 - 0.5) * 16;
        const e = clamp01(u * (0.8 + (i % 3) * 0.15));
        const px = lerp(hx + (dx / d) * 12, mx, e) + (-dy / d) * spread * (1 - e * 0.6);
        const py = lerp(hy + (dy / d) * 12, my, e) + (dx / d) * spread * (1 - e * 0.6);
        g.globalAlpha = 1;
        g.fillStyle = i % 2 ? '#ffffff' : R[4];
        this.line(g, px, py, px - (dx / d) * 8, py - (dy / d) * 8, 2);
      }
      if (u > 0.8) drawGlow(g, mx, my, 28 * b.k, R[4], 0.7);
    }
    // (3: rime crusted on it while it is chilled: specks of frost round it, glinting)
    if (b.t > L.pane && b.t < b.secs && m && !m.dead) {
      const top = FIGURE_SIZE[figureOf(m)]?.top ?? 24;
      const half = FIGURE_SIZE[figureOf(m)]?.half ?? 9;
      const fade = clamp01((b.secs - b.t) / 0.4);
      const bx = Math.round(wx(cam, b.lx, b.ly));
      const by = Math.round(wy(cam, b.lx, b.ly));
      for (let i = 0; i < 34; i++) {
        const sx = bx + ((hash(b.seed, i * 3) % (half * 2 + 1)) - half);
        const sy = by - 1 - (hash(b.seed, i * 3 + 1) % Math.max(1, top - 2));
        const glint = (Math.floor(this.t * 8) + i) % 9 === 0;
        g.globalAlpha = fade * (glint ? 1 : 0.75);
        g.fillStyle = glint ? '#ffffff' : i % 2 ? R[4] : '#e8f4f0';
        g.fillRect(sx, sy, 1, 1);
      }
      drawGlow(g, bx, by - top * 0.5, 20, R[4], 0.18 * fade);
    }
    g.globalAlpha = 1;
  }

  // ---- IMPLODE
  private implodeFloor(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const R = M8_RAMP.implode;
    const L = M8_LOOK.implode;
    const cx = wx(cam, b.x, b.y);
    const cy = wy(cam, b.x, b.y);
    if (b.t < b.wait) {
      // (the vortex: its ring closing, three arms turning in, the floor's dust dragged in along them)
      const u = b.t / b.wait;
      const rr = b.reach * (1 - ease(u) * 0.85);
      g.globalAlpha = 0.9;
      g.fillStyle = R[3];
      this.ring(g, cam, b.x, b.y, rr, 0, -this.t * 6);
      this.ring(g, cam, b.x, b.y, rr - 0.05, 0, -this.t * 6);
      g.fillStyle = R[4];
      this.ring(g, cam, b.x, b.y, rr, 3, -this.t * 6);
      for (let arm = 0; arm < 3; arm++) {
        for (let i = 0; i < 26; i++) {
          const v = i / 26;
          const a = arm * ((Math.PI * 2) / 3) + v * 3.2 - this.t * 7;
          const r2 = rr * (1 - v) * 22.6;
          g.globalAlpha = 0.85 * (1 - v * 0.5);
          g.fillStyle = v > 0.7 ? R[4] : v > 0.35 ? R[3] : R[2];
          g.fillRect(Math.round(cx + Math.cos(a) * r2), Math.round(cy + Math.sin(a) * r2 * 0.5), 2, 2);
        }
      }
      // (the dark point at its heart, swelling)
      const core = 2 + 7 * u * b.k;
      g.globalAlpha = 1;
      g.fillStyle = R[0];
      for (let yy = -Math.floor(core / 2); yy <= Math.floor(core / 2); yy++) {
        const half = Math.round(core * Math.sqrt(Math.max(0, 1 - (yy / (core / 2 + 0.5)) ** 2)));
        g.fillRect(Math.round(cx) - half, Math.round(cy) + yy, half * 2 + 1, 1);
      }
      g.fillStyle = R[4];
      this.ring(g, cam, b.x, b.y, (core + 1) / 22.6, 0, this.t * 9);
    } else {
      // (the burst's ring out to its reach; then the star scorched on the floor, fading)
      const u = (b.t - b.wait) / L.burst;
      if (u < 1) {
        g.globalAlpha = 1 - u;
        g.fillStyle = u < 0.2 ? '#ffffff' : R[4];
        this.ring(g, cam, b.x, b.y, b.r * ease(u));
        this.ring(g, cam, b.x, b.y, b.r * ease(u) - 0.05);
        g.fillStyle = R[3];
        this.ring(g, cam, b.x, b.y, b.r * ease(u) * 0.85, 2);
      }
      const s = (b.t - b.wait) / L.scorch;
      g.globalAlpha = 0.85 * (1 - s);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + b.seed;
        const len = b.r * 22.6 * (i % 2 ? 0.45 : 0.75);
        g.fillStyle = R[1];
        this.line(g, cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len * 0.5, 2);
        g.fillStyle = s < 0.3 ? R[4] : R[2];
        this.line(g, cx, cy, cx + Math.cos(a) * len * 0.6, cy + Math.sin(a) * len * 0.3, 1);
      }
    }
    g.globalAlpha = 1;
  }

  private implodeAir(g: CanvasRenderingContext2D, cam: Cam, b: Beat): void {
    const R = M8_RAMP.implode;
    const L = M8_LOOK.implode;
    const cx = wx(cam, b.x, b.y);
    const cy = wy(cam, b.x, b.y);
    const game = this.game!;
    if (b.t < b.wait) {
      // (everyone in its reach streaked toward its heart: violet lines trailing behind them)
      for (const m of game.monsters) {
        if (m.dead) continue;
        const d = Math.hypot(m.x - b.x, m.y - b.y);
        if (d > b.reach || d < 0.15) continue;
        const mx = wx(cam, m.x, m.y);
        const my = wy(cam, m.x, m.y) - 8;
        // (its streaks trail behind it, away from the heart it is dragged to)
        const far = Math.hypot(mx - cx, my + 8 - cy) || 1;
        const ux = (mx - cx) / far;
        const uy = (my + 8 - cy) / far;
        for (let i = 0; i < 3; i++) {
          g.globalAlpha = 0.8;
          g.fillStyle = i === 1 ? R[4] : R[3];
          const off = (i - 1) * 4;
          this.line(g, mx - uy * off, my + ux * off, mx - uy * off + ux * 14, my + ux * off + uy * 14, 1);
        }
      }
      drawGlow(g, cx, cy - 4, 30 * b.k, R[3], 0.3 + 0.3 * (b.t / b.wait));
    } else {
      // (the burst: a white point, rays, a column of light)
      const u = (b.t - b.wait) / L.burst;
      if (u < 1) {
        drawGlow(g, cx, cy - 6, 50 * b.k * (b.r / 2.2), '#ffffff', 0.9 * (1 - u));
        drawGlow(g, cx, cy - 6, 36 * b.k * (b.r / 2.2), R[3], 0.8 * (1 - u));
        g.globalAlpha = 1 - u;
        for (let i = 0; i < L.rays; i++) {
          const a = (i / L.rays) * Math.PI * 2 + b.seed * 0.3;
          const len = b.r * 22.6 * ease(u * 2) * (i % 2 ? 0.45 : 0.75);
          g.fillStyle = i % 2 ? R[4] : '#ffffff';
          this.line(g, cx, cy - 6, cx + Math.cos(a) * len, cy - 6 + Math.sin(a) * len * 0.55, 2);
        }
        if (u < 0.4) {
          g.globalAlpha = 1 - u / 0.4;
          g.fillStyle = '#ffffff';
          g.fillRect(Math.round(cx) - 1, Math.round(cy - 6 - 40 * (1 - u)), 3, Math.round(40 * (1 - u)));
          g.fillStyle = R[4];
          g.fillRect(Math.round(cx) - 3, Math.round(cy - 6 - 30 * (1 - u)), 1, Math.round(30 * (1 - u)));
          g.fillRect(Math.round(cx) + 3, Math.round(cy - 6 - 30 * (1 - u)), 1, Math.round(30 * (1 - u)));
        }
      }
    }
    g.globalAlpha = 1;
  }
}

/** A whole-number hash of two numbers (the looks' own, so that a frame's jag is the same each time it is drawn). */
function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return h >>> 0;
}
