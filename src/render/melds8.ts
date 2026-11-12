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

import { P } from '../art/palette';
import { Px } from '../engine/px';

/** The switch. Off: nothing here is drawn, lit, ticked or read, and the game is as it was. */
export const MELDS8_LOOK = { on: false };

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
