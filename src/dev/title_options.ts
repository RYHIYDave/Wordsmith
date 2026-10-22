// Concept art, not part of the game: TEN NEW PICTURES FOR THE TITLE SCREEN, for the owner to pick from.
//
// The owner to the art chat, 21 Oct 2026, 17:26 Pacific: “I’d like to scrap the title screen and start
// again.  I like the moving picture style, but I don’t like the current art.  Can you give me 10 low res
// options to choose from?  Doesn’t have to have a wordsmith in the picture, but I could, go in any
// direction with it.  They don’t need to be animated before I see them.”
//
// So: ten stills, each a different direction, each painted small (TW x TH, half the size the game would
// paint it), each with a line of what would move in it. The one he picks is painted again at full size
// and given its life, as the old wordsmith's was (art/title_smith3.ts).
//
// What glows on a friend is cyan; pink burning to gold is the enemy's; an honest flame is orange.

import { drawText } from '../engine/font';
import { C, Pic, Pt, TH, TW, band, bay, clamp01, fbm, h, mix, noise1, noise2, ridge, rnd, scale } from './title_options_kit';

export interface TitleOption {
  n: number;
  name: string;
  /** What would move in it, in a line. */
  life: string;
  /** Whether the picture carries the game's name itself (else the game draws it over the top). */
  ownTitle?: boolean;
  paint: (p: Pic) => void;
}

// ---------------------------------------------------------------------------------------------
// Shared colours

const CY = h('#22d0e0');
const CY_HI = h('#b8fff8');
const CY_LO = h('#0c6a80');
const PK = h('#e0287a');
const PK_HI = h('#ff7aa8');
const GOLD = h('#ffe070');
const FIRE = h('#ff8a2a');
const FIRE_HI = h('#ffc24a');
const FIRE_WH = h('#fff0a0');
const WHITE = 0xffffff;

// The knight, small: helm, red scarf, a blade lit cyan. Seen from behind, facing up-right.
const KNIGHT_KEY: Record<string, C> = {
  h: h('#b4c0d0'),
  H: h('#7a879c'),
  m: h('#4a5466'),
  r: h('#c02838'),
  R: h('#6e1020'),
  k: h('#1c1838'),
  c: CY,
  C: CY_HI,
  s: h('#2e3440'),
};
const KNIGHT_BACK = [
  '....h.....',
  '...hhH....',
  '..hhHHr...',
  '..mHHrrrr.',
  '.rrrRRRrrr',
  '.rRRRRmR..',
  '.mRRRRm.C.',
  '..RRRRmc..',
  '..RRkRRc..',
  '..kk.kkc..',
  '..k...kc..',
  '..s...s...',
];

// ---------------------------------------------------------------------------------------------
// 1. ASLEEP IN THE LIBRARY: where the story starts. The kid asleep on a book in the library at night,
// and his dream rising out of it: a stair of letters into the dark, the knight climbing it.

function paintLibrary(p: Pic): void {
  const NIGHT = h('#0b0a1e');
  p.fill(NIGHT);
  const LX = 66;
  const LY = 72;
  const lamp = (x: number, y: number): number => band(clamp01(1 - Math.hypot((x - LX) * 0.85, (y - LY) * 1.15) / 120), 6);
  const moon = (x: number, y: number): number => band(clamp01(1 - Math.hypot(x - 24, (y - 40) * 0.8) / 70), 4);
  const lit = (c: C, x: number, y: number, k = 1): C => {
    const l = lamp(x, y) * k;
    const m = moon(x, y) * 0.5 * k;
    let o = mix(NIGHT, c, 0.12 + 0.88 * Math.max(l, m));
    o = mix(o, h('#ff9a40'), l * 0.18);
    return mix(o, h('#7088d8'), m * 0.25 * (1 - l));
  };

  // The far wall: bookcases up into the dark.
  const WOOD = h('#4a2c1a');
  const SPINES = ['#5a2430', '#2a3a5e', '#38482a', '#5e4a2a', '#46285a', '#264848', '#6a5634', '#7a3a2a'].map(h);
  const boards = [13, 27, 41, 55, 69];
  for (let y = 0; y < 84; y++) for (let x = 0; x < TW; x++) p.set(x, y, lit(h('#20141a'), x, y));
  for (const by of boards) {
    for (let x = 0; x < TW; x++) {
      if (x < 44) continue;
      // books standing on this board
      const bx = x;
      const seg = Math.floor(rnd(bx >> 1, by, 3) * 3);
      void seg;
    }
    let x = 46;
    let i = 0;
    while (x < TW) {
      const w = 2 + Math.floor(rnd(i, by, 11) * 3);
      const ht = 7 + Math.floor(rnd(i, by, 12) * 5);
      const gap = rnd(i, by, 13) > 0.9;
      const leaning = rnd(i, by, 14) > 0.93;
      if (!gap) {
        const base = SPINES[Math.floor(rnd(i, by, 15) * SPINES.length)];
        for (let yy = by - ht; yy < by; yy++) {
          for (let xx = x; xx < x + w; xx++) {
            const lx = leaning ? xx + Math.floor((by - yy) / 4) : xx;
            let c = base;
            if (xx === x) c = scale(base, 1.25);
            if (xx === x + w - 1 && w > 2) c = scale(base, 0.7);
            if (yy === by - ht + 2 || yy === by - 3) c = mix(c, h('#8a6a30'), 0.6);
            p.set(lx, yy, lit(c, lx, yy));
          }
        }
      }
      x += w + (gap ? 3 : 0);
      i++;
    }
    for (let x2 = 44; x2 < TW; x2++) {
      p.set(x2, by, lit(h('#7e4f2c'), x2, by));
      p.set(x2, by + 1, lit(WOOD, x2, by + 1));
    }
  }
  // uprights
  for (const ux of [44, 96, 148, 200, 252]) {
    for (let y = 0; y < 84; y++) for (let x = ux; x < ux + 4; x++) p.set(x, y, lit(x === ux ? h('#7e4f2c') : WOOD, x, y));
  }
  // The window, the moon in it.
  const win = (x: number, y: number): boolean => x >= 8 && x <= 38 && y <= 72 && (y >= 24 || Math.hypot(x - 23, y - 24) <= 15.5);
  for (let y = 4; y <= 74; y++) {
    for (let x = 4; x <= 42; x++) {
      const inner = win(x, y);
      const frame = !inner && (win(x - 2, y) || win(x + 2, y) || win(x, y - 2) || win(x, y + 2));
      if (frame) p.set(x, y, lit(h('#3a3040'), x, y));
      if (!inner) continue;
      let c = mix(h('#141c48'), h('#24346e'), band((y - 8) / 70, 4));
      if (x === 23 || y === 30 || y === 52) c = h('#0c0a1c');
      p.set(x, y, c);
    }
  }
  p.ellipse(16, 18, 4, 4, h('#e8eeff'));
  p.ellipse(17, 17, 3, 3, h('#c8d2f0'), 0.5);
  p.stars(10, 70, 41, 30, (x, y) => win(x, y) && Math.hypot(x - 16, y - 18) > 6 && x !== 23 && y !== 30 && y !== 52);
  

  // The kid, asleep: side-on behind the table, his head on his folded arms, his face to the lamp.
  const SW = h('#6e2a44');
  const SWL = h('#a84a5a');
  // the chair's back behind him
  for (const cx of [162, 168]) p.rect(cx, 66, 3, 22, lit(h('#4a2c1a'), cx, 70));
  p.rect(160, 64, 12, 3, lit(h('#6e4526'), 160, 64));
  // his hunched back
  p.poly([[122, 88], [124, 76], [130, 67], [140, 63], [150, 66], [157, 75], [160, 88]], (x, y) => lit(x < 136 - (y - 63) * 0.2 ? SWL : SW, x, y, 1.2));
  p.line(140, 64, 156, 76, lit(h('#3a1a2c'), 150, 70, 1.2));
  // The table: its top, then its front.
  for (let y = 84; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      if (y < 100) {
        const plank = (y - 84) % 5 === 0;
        p.set(x, y, lit(plank ? h('#4a2c1a') : mix(h('#6e4526'), h('#96643a'), noise2(x * 0.15, y * 0.8, 5) > 0.6 ? 0.4 : 0), x, y, 1.1));
      } else if (y === 100) p.set(x, y, lit(h('#c08a55'), x, y));
      else p.set(x, y, lit(mix(h('#2d1b12'), h('#4a2c1a'), (x % 40 < 2 ? 0 : 0.6)), x, y, 0.8));
    }
  }
  // the pool of the lamp's light on the table
  p.glow(LX, 90, 42, 9, h('#ff9a40'), 0.5, 4);

  // his arms folded on the table, a hand out at the end
  p.poly([[104, 83], [110, 80], [134, 80], [138, 84], [134, 89], [106, 89]], (x, y) => lit(y < 83 ? SWL : SW, x, y, 1.25));
  p.ellipse(103, 86, 3, 2, lit(h('#dc9c74'), 103, 86, 1.3));
  p.set(101, 86, lit(h('#b07050'), 101, 86, 1.3));
  // his head, his cheek on his arm, his face turned to us
  const HX = 119;
  const HY = 75;
  p.ellipse(HX, HY, 7, 6.5, (x, y) => lit(h('#dc9c74'), x, y, 1.35));
  p.ellipse(HX + 3, HY - 2, 6, 5, (x, y, n) => lit(n > 0.7 && y < HY - 4 ? h('#8a5a34') : h('#4a2c1a'), x, y, 1.3));
  p.poly([[HX - 6, HY - 2], [HX - 4, HY - 7], [HX + 2, HY - 9], [HX + 4, HY - 4], [HX - 2, HY - 3]], lit(h('#5a3620'), HX, HY - 6, 1.3));
  p.set(HX - 5, HY - 8, lit(h('#5a3620'), HX, HY - 6, 1.3));
  p.set(HX + 1, HY - 10, lit(h('#5a3620'), HX, HY - 6, 1.3));
  p.ellipse(HX + 6, HY + 1, 1.5, 2, lit(h('#b07050'), HX + 6, HY, 1.3));
  // eyes shut, mouth open a little
  p.hline(HX - 4, HX - 2, HY + 1, h('#5a2a2a'));
  p.set(HX - 5, HY + 2, h('#5a2a2a'));
  p.set(HX - 3, HY + 4, h('#7a3a3a'));
  p.set(HX - 6, HY + 2, lit(h('#f4c8a0'), HX - 6, HY, 1.4));
  // a breath of sleep: "z"
  p.sprite(HX - 14, HY - 14, ['xxx', '.x.', 'xxx'], { x: lit(h('#d4cbb0'), HX - 14, HY - 14, 1.2) });
  p.sprite(HX - 19, HY - 20, ['xx', 'xx'], { x: lit(h('#a39a82'), HX - 19, HY - 20, 1.2) });

  // The open book under his arms, its pages lit by his dream.
  p.poly([[112, 90], [133, 88], [134, 96], [110, 98]], h('#d4cbb0'));
  p.poly([[134, 88], [156, 90], [158, 98], [134, 96]], h('#f2ecd8'));
  p.line(134, 88, 134, 96, h('#8a7e66'));
  for (let i = 0; i < 3; i++) {
    p.line(115, 91 + i * 2, 130, 90 + i * 2, h('#9a907a'));
    p.line(138, 90 + i * 2, 153, 92 + i * 2, h('#22a0b0'));
  }
  p.glow(140, 90, 26, 12, CY, 0.45, 4);

  // The lamp.
  p.ellipse(LX, 89, 8, 2, h('#7a4a10'));
  p.hline(LX - 7, LX + 7, 88, h('#e8b030'));
  p.rect(LX - 1, 74, 2, 14, h('#b87a1c'));
  p.set(LX - 1, 80, h('#ffe070'));
  p.poly([[LX - 12, 74], [LX + 12, 74], [LX + 7, 64], [LX - 7, 64]], (x, y) => (y === 64 || x < LX - 6 + (y - 64) * 0.3 ? h('#3c9038') : y > 71 ? h('#84c84c') : h('#1e5a2a')));
  p.hline(LX - 12, LX + 12, 74, h('#d0f080'));
  p.ellipse(LX, 76, 4, 1.5, FIRE_WH);
  p.glow(LX, 76, 70, 40, h('#ff8a2a'), 0.32, 5);

  // THE DREAM: a stair of letters rising out of the book, the knight on it, a dark door above.
  const steps: Pt[] = [
    [150, 74],
    [160, 64],
    [171, 55],
    [181, 46],
    [192, 38],
    [203, 31],
  ];
  steps.forEach(([x, y], i) => {
    const w = 10 - Math.floor(i / 2);
    p.rect(x, y, w, 2, h('#b0a4e0'));
    p.rect(x, y + 2, w, 5, h('#4a4470'));
    p.rect(x, y + 7, w, 1, h('#2a2464'));
    p.rune(x + Math.floor(w / 2) - 1, y + 2, i * 3 + 1, CY);
    p.glow(x + w / 2, y + 4, 10, 7, CY, 0.22, 3);
  });
  // motes of letters drifting up between the steps
  for (let i = 0; i < 26; i++) {
    const k = rnd(i, 3, 77);
    const x = 140 + k * 70 + (rnd(i, 4, 77) - 0.5) * 18;
    const y = 84 - k * 60 + (rnd(i, 5, 77) - 0.5) * 10;
    p.set(x, y, rnd(i, 6, 77) > 0.5 ? CY_HI : CY);
    if (rnd(i, 7, 77) > 0.7) p.set(x, y - 1, CY);
  }
  // the knight, climbing
  p.glow(174, 49, 9, 9, CY, 0.25, 3);
  p.sprite(169, 43, KNIGHT_BACK, KNIGHT_KEY);
  // the door at the top: stone, dark inside, two eyes in it
  const DX = 220;
  const DY = 6;
  const door = (x: number, y: number, r: number): boolean => x >= DX - r && x <= DX + r && y <= DY + 32 && (y >= DY + 10 || Math.hypot(x - DX, y - (DY + 10)) <= r);
  for (let y = DY - 4; y <= DY + 34; y++) {
    for (let x = DX - 18; x <= DX + 18; x++) {
      if (door(x, y, 9)) p.set(x, y, h('#05040c'));
      else if (door(x, y, 14)) p.set(x, y, (x + y) % 7 === 0 ? h('#2a2464') : x < DX ? h('#5a5490') : h('#3a3470'));
    }
  }
  p.rect(DX - 16, DY + 32, 33, 3, h('#4a4470'));
  p.hline(DX - 16, DX + 16, DY + 32, h('#8a84c0'));
  p.glow(DX, DY + 22, 9, 10, PK, 0.25, 3);
  p.set(DX - 3, DY + 18, PK_HI);
  p.set(DX + 2, DY + 18, PK_HI);
  p.set(DX - 3, DY + 17, PK);
  p.set(DX + 2, DY + 17, PK);
}

// ---------------------------------------------------------------------------------------------
// 2. THE FORGE OF WORDS: wordsmithing itself. An anvil in the dark, a word laid on it white-hot
// and cyan, the wordsmith's great runed arm bringing the hammer down; the sparks fly as letters.

function paintForge(p: Pic): void {
  const DARK = h('#0c0a16');
  p.fill(DARK);
  const FX = 44;
  const FY = 62;
  const fire = (x: number, y: number): number => band(clamp01(1 - Math.hypot((x - FX) * 0.8, (y - FY) * 1.1) / 110), 6);
  const SX = 136;
  const SY = 64;
  const word = (x: number, y: number): number => band(clamp01(1 - Math.hypot((x - SX) * 0.9, (y - SY) * 1.2) / 80), 6);
  const lit = (c: C, x: number, y: number, k = 1): C => {
    const f = fire(x, y) * k;
    const w = word(x, y) * k;
    let o = mix(DARK, c, 0.1 + 0.9 * Math.max(f, w));
    o = mix(o, FIRE, f * 0.22);
    return mix(o, CY, w * 0.22 * (1 - f * 0.5));
  };
  // the stone wall behind: big blocks
  for (let y = 0; y < 96; y++) {
    for (let x = 0; x < TW; x++) {
      const row = Math.floor(y / 11);
      const off = row % 2 ? 9 : 0;
      const joint = y % 11 === 0 || (x + off) % 18 === 0;
      const tone = noise2(x * 0.2, y * 0.2, row) > 0.55 ? h('#3a3448') : h('#2c2638');
      p.set(x, y, lit(joint ? h('#14101e') : tone, x, y));
    }
  }
  // the forge: a hood over a fire in an arched mouth
  p.poly([[6, 6], [82, 6], [92, 30], [-4, 30]], (x, y) => lit(y < 9 ? h('#4a4258') : h('#3a3448'), x, y, 1.1));
  p.hline(-4, 92, 30, lit(h('#6a6078'), 44, 30));
  for (let y = 32; y < 86; y++) {
    for (let x = 4; x < 86; x++) {
      const inMouth = x >= 16 && x <= 72 && y >= 52 ? true : Math.hypot(x - 44, y - 52) <= 28 && y < 52;
      const inArch = x >= 10 && x <= 78 && y >= 52 ? true : Math.hypot(x - 44, y - 52) <= 34 && y < 52;
      if (inMouth) {
        const t = clamp01((y - 40) / 44);
        const flick = noise2(x * 0.18, y * 0.09, 4);
        const heat = band(clamp01(t * 1.2 - (1 - flick) * 0.5 + 0.1 - Math.abs(x - 44) / 70), 5);
        p.set(x, y, heat > 0.8 ? FIRE_WH : heat > 0.6 ? FIRE_HI : heat > 0.4 ? FIRE : heat > 0.2 ? h('#a82810') : h('#3a0c08'));
      } else if (inArch) p.set(x, y, (x + y) % 9 === 0 ? h('#5c1408') : lit(h('#544038'), x, y, 1.2));
    }
  }
  // coals heaped in the mouth
  for (let i = 0; i < 40; i++) {
    const x = 18 + rnd(i, 1, 9) * 52;
    const y = 80 + rnd(i, 2, 9) * 6;
    p.ellipse(x, y, 2, 1, rnd(i, 3, 9) > 0.5 ? FIRE_HI : h('#a82810'));
  }
  p.glow(FX, FY + 10, 110, 70, FIRE, 0.38, 6);
  // the floor
  for (let y = 96; y < TH; y++) for (let x = 0; x < TW; x++) p.set(x, y, lit((x + (y % 2) * 7) % 14 === 0 ? h('#1c1626') : h('#2a2232'), x, y, 0.9));
  // the stump
  p.poly([[100, 118], [104, 98], [168, 98], [172, 118]], (x, y) => lit(x < 116 ? h('#6e4526') : (x % 9 === 0 ? h('#2d1b12') : h('#4a2c1a')), x, y, 1.1));
  p.ellipse(136, 98, 34, 3, (x, y) => lit(h('#96643a'), x, y, 1.1));
  // THE ANVIL: horn to the left, its face lit from the word on it
  const IRON_T = h('#7a879c');
  const IRON_L = h('#4a5466');
  const IRON_D = h('#2e3440');
  p.poly([[108, 97], [112, 90], [160, 90], [166, 97]], (x, y) => lit(x < 118 ? IRON_L : IRON_D, x, y, 1.6));
  p.hline(112, 160, 90, lit(IRON_T, 136, 90, 1.6));
  p.poly([[120, 90], [124, 78], [150, 78], [154, 90]], (x, y) => lit(x < 128 ? IRON_L : IRON_D, x, y, 1.6));
  p.line(124, 78, 120, 90, lit(IRON_T, 122, 84, 1.6));
  p.poly([[80, 70], [96, 66], [170, 66], [172, 78], [100, 78], [88, 74]], (x, y) => lit(y < 70 ? IRON_T : x < 120 ? IRON_L : IRON_D, x, y, 1.3));
  p.hline(96, 170, 66, lit(h('#b4c0d0'), 136, 66, 1.3));
  p.poly([[80, 70], [96, 66], [96, 68]], lit(h('#b4c0d0'), 90, 68, 1.3));
  // the word on it, white-hot cyan, held in tongs from the left
  p.line(66, 58, 112, 64, h('#4a5466'));
  p.line(66, 60, 112, 65, h('#2e3440'));
  p.line(62, 56, 70, 60, h('#4a5466'));
  p.rect(112, 61, 46, 5, CY);
  p.rect(113, 62, 44, 3, CY_HI);
  for (let i = 0; i < 7; i++) p.rune(115 + i * 6, 60, i + 2, i % 2 ? WHITE : CY_HI);
  p.glow(SX, SY, 60, 30, CY, 0.5, 5);
  // THE HAMMER, just come down on it, in the wordsmith's great runed fist
  const HX = 150;
  const HY = 50;
  // the handle, short, up to the fist
  p.line(HX + 6, HY - 2, 182, 30, h('#6e4526'));
  p.line(HX + 7, HY - 1, 183, 31, h('#4a2c1a'));
  p.line(HX + 6, HY - 3, 181, 29, h('#96643a'));
  // the head: a heavy block, its face down on the word
  p.poly([[HX - 12, HY + 2], [HX + 6, HY - 8], [HX + 14, HY + 4], [HX - 4, HY + 14]], (x, y) => (y < HY + 4 + (x - HX) * -0.55 ? h('#b4c0d0') : x > HX + 2 ? h('#2e3440') : h('#4a5466')));
  p.line(HX - 12, HY + 2, HX + 6, HY - 8, h('#e6edf5'));
  p.line(HX - 4, HY + 14, HX + 14, HY + 4, CY_HI);
  // the arm: down out of the dark at the top right, bare and huge, runes burning in it, a teal sleeve
  const ARM_HI = h('#d6d0f0');
  const ARM = h('#a89cd0');
  const ARM_LO = h('#6a5e9a');
  p.poly([[262, -12], [228, -12], [190, 22], [194, 38], [262, 22]], (x, y) => {
    const across = (y - 24) - (x - 178) * -0.42; // above the arm's middle line: lit
    return across < -8 ? ARM_HI : across < 4 ? ARM : ARM_LO;
  });
  // the sleeve, rolled back to the elbow
  p.poly([[262, -8], [246, -8], [226, 4], [234, 18], [262, 8]], (x, y) => (y < 2 + (x - 226) * -0.3 ? h('#3cc4c0') : h('#157a8c')));
  p.line(226, 4, 234, 18, h('#0c3a52'));
  // the fist round the handle
  p.ellipse(183, 32, 12, 10, (x, y, n) => (n > 0.86 ? ARM_LO : x < 181 && y < 30 ? ARM_HI : ARM));
  // knuckles, the fingers wrapped round the handle, the thumb over them
  for (let i = 0; i < 4; i++) {
    p.ellipse(173 + i * 3.5, 30 + i * 3, 2.5, 2.5, (x, y, n) => (n > 0.7 ? ARM_LO : x + y < 203 + i * 6.5 ? ARM_HI : ARM));
  }
  p.line(178, 24, 188, 26, ARM_HI);
  p.line(178, 25, 188, 27, ARM_LO);
  // runes burning in the arm
  p.rune(204, 14, 2, CY_HI);
  p.rune(216, 6, 5, CY);
  p.rune(192, 22, 6, CY);
  p.glow(206, 16, 30, 18, CY, 0.25, 3);
  // THE SPARKS: a burst of letters off the blow
  for (let i = 0; i < 46; i++) {
    const a = -Math.PI * (0.05 + rnd(i, 1, 21) * 0.9);
    const r = 8 + rnd(i, 2, 21) * 70;
    const x = SX + Math.cos(a) * r * 1.3;
    const y = SY - 4 + Math.sin(a) * r * 0.75;
    if (rnd(i, 3, 21) > 0.75) p.rune(x, y, i, rnd(i, 4, 21) > 0.5 ? CY_HI : CY);
    else {
      p.line(x, y, x - Math.cos(a) * 3, y - Math.sin(a) * 2, CY);
      p.set(x, y, CY_HI);
    }
  }
  p.glow(SX, SY - 2, 26, 14, CY_HI, 0.35, 3);
}

// ---------------------------------------------------------------------------------------------
// 3. ABOVE THE BESIEGED TOWN: the vista. The knight on a crag at night, the mountain road winding
// down to the town far below, under the cult's dome of pink sorcery.

function paintCliff(p: Pic): void {
  p.vgrad(0, 84, [h('#0a0824'), h('#14103a'), h('#24184e'), h('#3e2058'), h('#5a2a5e')]);
  p.stars(0, 60, 5, 110);
  // the moon, its halo in rings
  p.haze(46, 26, 26, 26, h('#3a3a7a'), 0.35, 3);
  p.ellipse(46, 26, 9, 9, (x, y) => (x + y < 66 ? h('#f0f0ff') : h('#c8ccf0')));
  p.ellipse(49, 24, 2, 2, h('#b0b4e0'));
  p.ellipse(43, 29, 1.5, 1.5, h('#b0b4e0'));
  // long thin clouds
  for (let y = 30; y < 60; y++) {
    for (let x = 0; x < TW; x++) {
      const c = fbm(x * 0.012, y * 0.12, 3, 3);
      if (c > 0.62) p.over(x, y, h('#4a3a7a'), band((c - 0.62) * 4, 3) * 0.7);
    }
  }
  // the far range, then the near one
  for (let x = 0; x < TW; x++) {
    const a = ridge(x, 70, 30, 0.035, 11, 0.6);
    const b = ridge(x, 82, 18, 0.05, 12, 0.3);
    for (let y = Math.floor(a); y < TH; y++) p.set(x, y, y < a + 2 ? h('#4a3a78') : (x + y) % 23 === 0 ? h('#2a2256') : h('#30285e'));
    for (let y = Math.floor(b); y < TH; y++) p.set(x, y, y < b + 1 ? h('#3a2e68') : h('#211a46'));
  }
  // the valley floor, and the town in it under the dome
  const TX = 176;
  const TY = 94;
  p.ellipse(TX, TY + 4, 70, 9, h('#1a1438'));
  for (let i = 0; i < 34; i++) {
    const x = TX - 30 + rnd(i, 1, 31) * 60;
    const w = 3 + Math.floor(rnd(i, 2, 31) * 4);
    const ht = 3 + Math.floor(rnd(i, 3, 31) * 5) + (Math.abs(x - TX) < 10 ? 4 : 0);
    const y = TY + 2 - rnd(i, 4, 31) * 6;
    p.rect(x, y - ht, w, ht, h('#100c24'));
    p.poly([[x - 1, y - ht], [x + w / 2, y - ht - 3], [x + w + 1, y - ht]], h('#1a1434'));
    if (rnd(i, 5, 31) > 0.4) p.set(x + 1, y - ht + 2, rnd(i, 6, 31) > 0.5 ? FIRE_HI : FIRE);
  }
  // the keep's tower in the middle
  p.rect(TX - 2, TY - 22, 5, 20, h('#100c24'));
  p.poly([[TX - 3, TY - 22], [TX + 0.5, TY - 30], [TX + 4, TY - 22]], h('#1a1434'));
  p.set(TX, TY - 18, FIRE_HI);
  // THE DOME: the cult's siege, pink burning to gold, a lattice of its fire
  const DR = 46;
  const DRY = 34;
  for (let y = TY - DRY - 2; y <= TY + 6; y++) {
    for (let x = TX - DR - 2; x <= TX + DR + 2; x++) {
      const n = Math.hypot((x - TX) / DR, (y - TY) / DRY);
      if (n > 1 || y > TY + 5) continue;
      const lat = (Math.round((x - TX) / 6) * 6 === x - TX && (x + y) % 2 === 0) || ((y - TY) % 7 === 0 && (x + y) % 2 === 0);
      if (n > 0.94) p.set(x, y, y < TY - DRY * 0.8 ? GOLD : PK_HI);
      else if (n > 0.86) p.over(x, y, PK, 0.55);
      else p.over(x, y, PK, lat && n > 0.3 ? 0.35 : 0.13);
    }
  }
  p.glow(TX, TY - 10, DR + 26, DRY + 18, PK, 0.18, 4);
  for (let i = 0; i < 18; i++) {
    const a = rnd(i, 1, 51) * Math.PI;
    p.set(TX + Math.cos(a) * DR * (0.9 + rnd(i, 2, 51) * 0.3), TY - Math.sin(a) * DRY * (0.9 + rnd(i, 3, 51) * 0.3) - 3, rnd(i, 4, 51) > 0.6 ? GOLD : PK_HI);
  }
  // the road winding down to it
  const road: Pt[] = [[60, 118], [96, 108], [74, 102], [112, 98], [140, 96], [150, 95]];
  for (let i = 0; i + 1 < road.length; i++) p.line(road[i][0], road[i][1], road[i + 1][0], road[i + 1][1], h('#5a4a7a'));
  // THE CRAG: the knight on it, the near rock black against the valley
  p.poly([[-2, 118], [-2, 86], [18, 82], [40, 76], [58, 70], [72, 70], [84, 76], [96, 92], [104, 104], [120, 118]], (x, y) => ((x + y) % 31 === 0 ? h('#1a1432') : h('#0c0a1e')));
  p.line(40, 76, 58, 70, h('#3a3470'));
  p.line(58, 70, 72, 70, h('#5a5490'));
  p.line(72, 70, 84, 76, h('#2a2456'));
  p.line(18, 82, 40, 76, h('#2a2456'));
  // the knight, his scarf out on the wind toward the town
  p.glow(64, 64, 10, 10, CY, 0.2, 3);
  p.sprite(58, 58, KNIGHT_BACK, KNIGHT_KEY);
  p.line(67, 61, 76, 59, h('#c02838'));
  p.line(68, 62, 79, 62, h('#6e1020'));
  p.set(77, 58, h('#c02838'));
}

// ---------------------------------------------------------------------------------------------
// 4. THE DESCENT: straight down a deep round shaft, a stair winding round its wall into the dark,
// torches all the way down, something pink waiting at the bottom; the knight small at the top.

function paintDescent(p: Pic): void {
  const CX = 128;
  const CYY = 62;
  const SQ = 0.62;
  const R0 = 34;
  const PITCH = 1.35;
  const torches: { x: number; y: number; z: number }[] = [];
  const at = (z: number, th: number): Pt => {
    const r = R0 / (z + 0.25);
    return [CX + Math.cos(th) * r * 1.6, CYY + Math.sin(th) * r * 1.6 * SQ - 6 / (z + 0.6)];
  };
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const dx = (x + 0.5 - CX) / 1.6;
      const dy = (y + 0.5 - CYY) / (1.6 * SQ);
      const r = Math.hypot(dx, dy);
      const z = R0 / Math.max(r, 0.5) - 0.25;
      const th = Math.atan2(dy, dx);
      const dark = clamp01(1 - z / 9);
      if (z > 9) {
        p.set(x, y, h('#06040c'));
        continue;
      }
      // the stair: a helix of steps, its top face light
      const u = (th + Math.PI) / (Math.PI * 2);
      const zs = (z - u * PITCH) / PITCH;
      const fz = zs - Math.floor(zs);
      const onStep = fz < 0.18;
      const stepEdge = onStep && Math.floor(u * 40) % 2 === 0 && fz > 0.13;
      // block courses
      const course = Math.floor(z * 6);
      const off = course % 2 ? 0.5 : 0;
      const joint = (z * 6) % 1 < 0.12 || ((u * 48 + off) % 1) < 0.06;
      // light from the side of the shaft we look down on (the far wall is lit)
      const side = 0.65 + 0.35 * Math.sin(th);
      let c: C;
      if (onStep) c = stepEdge ? h('#3a3264') : mix(h('#4a4278'), h('#a39ad0'), side * 0.8);
      else c = joint ? h('#120e24') : mix(h('#1e1a3a'), h('#4a4470'), side * 0.7 * (noise2(u * 48, z * 6, 3) > 0.5 ? 1 : 0.8));
      p.set(x, y, mix(h('#06040c'), c, band(dark, 7)));
    }
  }
  // torches up the stair, each a little flame and its pool of honest light
  for (let k = 0; k < 14; k++) {
    const th = -Math.PI + ((k * 2.3) % (Math.PI * 2));
    const u = (th + Math.PI) / (Math.PI * 2);
    const z = (Math.floor(k / 2.2) + u) * PITCH + 0.35;
    if (z > 8.5) continue;
    const [x, y] = at(z, th);
    torches.push({ x, y, z });
  }
  for (const t of torches) {
    const s = clamp01(1.4 / (t.z + 0.4));
    p.glow(t.x, t.y, 4 + s * 22, 3 + s * 14, FIRE, 0.45 * s + 0.1, 4);
  }
  for (const t of torches) {
    const s = clamp01(1.4 / (t.z + 0.4));
    p.set(t.x, t.y, FIRE_WH);
    if (s > 0.35) {
      p.set(t.x, t.y - 1, FIRE_HI);
      p.set(t.x, t.y + 1, h('#6e4526'));
    }
    if (s > 0.6) {
      p.set(t.x - 1, t.y, FIRE);
      p.set(t.x + 1, t.y, FIRE);
      p.set(t.x, t.y - 2, FIRE);
      p.set(t.x, t.y + 2, h('#4a2c1a'));
    }
  }
  // THE BOTTOM: something waiting, pink burning to gold
  p.glow(CX, CYY - 2, 18, 11, PK, 0.6, 5);
  p.glow(CX, CYY - 2, 7, 4, GOLD, 0.5, 3);
  p.set(CX - 2, CYY - 2, PK_HI);
  p.set(CX + 2, CYY - 2, PK_HI);
  // dust drifting down the shaft
  for (let i = 0; i < 40; i++) {
    const x = CX + (rnd(i, 1, 61) - 0.5) * 200;
    const y = CYY + (rnd(i, 2, 61) - 0.5) * 110;
    p.add(x, y, h('#8a84c0'), 0.35);
  }
  // the knight, small, on the stair near the top, his blade lit
  const [kx, ky] = at(0.62, Math.PI * 0.62);
  p.glow(kx + 4, ky + 2, 16, 11, CY, 0.32, 4);
  p.sprite(kx, ky - 6, KNIGHT_BACK, KNIGHT_KEY);
}

// ---------------------------------------------------------------------------------------------
// 5. THE STORYBOOK: the whole adventure as a pop-up book standing open on a dark desk: the mountain
// and its prison, the road down, the town and its bells, cut from paper; words rising off its pages.

/** A flat cut of paper: its colour, its lit edge along the top, a shadow cast on the page under it. */
function paper(p: Pic, pts: readonly Pt[], c: C, shadow = true): void {
  if (shadow) p.poly(pts.map(([x, y]) => [x + 2, y + 1] as Pt), (x, y) => mix(p.get(x, y), h('#2a1c30'), 0.45));
  p.poly(pts, c);
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    if (bx - ax > 0 && Math.abs(by - ay) <= Math.abs(bx - ax) * 2.5) p.line(ax, ay, bx, by, mix(c, 0xfff6e0, 0.55));
  }
}

function paintStorybook(p: Pic): void {
  p.vgrad(0, TH, [h('#0a0818'), h('#120e26'), h('#1a1430')]);
  // the desk
  for (let y = 98; y < TH; y++) for (let x = 0; x < TW; x++) p.set(x, y, (y - 98) % 6 === 0 ? h('#1e1222') : h('#2a1a26'));
  p.glow(128, 92, 150, 40, h('#ffb060'), 0.22, 5);
  // the book's cover under its pages
  p.poly([[14, 106], [128, 112], [242, 106], [236, 100], [128, 105], [20, 100]], h('#5c1420'));
  p.line(14, 106, 128, 112, h('#b87a1c'));
  p.line(128, 112, 242, 106, h('#b87a1c'));
  // its pages: two leaves, a sag to the gutter, the edges of the leaves under them
  const pageL = (x: number, y: number): C => mix(h('#d4c49c'), h('#f2e6c4'), band(clamp01((x - 20) / 108), 3));
  const pageR = (x: number, y: number): C => mix(h('#f6ecd0'), h('#d8c8a0'), band(clamp01((x - 128) / 108), 3));
  p.poly([[20, 100], [24, 76], [70, 70], [128, 80], [128, 105]], pageL);
  p.poly([[128, 105], [128, 80], [186, 70], [232, 76], [236, 100]], pageR);
  for (let i = 1; i <= 3; i++) {
    p.line(20, 100 + i, 128, 105 + i, h('#b8a880'));
    p.line(128, 105 + i, 236, 100 + i, h('#b8a880'));
  }
  p.line(128, 80, 128, 105, h('#8a7a5a'));
  // writing on the pages, faint
  for (let i = 0; i < 9; i++) {
    p.line(30 + (i % 2) * 4, 84 + i * 2, 66, 82 + i * 2.2, h('#a89470'), 0.5);
    p.line(190, 82 + i * 2.2, 226 - (i % 2) * 4, 84 + i * 2, h('#a89470'), 0.5);
  }
  // LEFT LEAF: the mountain, the prison at its top
  paper(p, [[30, 92], [58, 40], [72, 52], [84, 34], [112, 92]], h('#6a6290'));
  paper(p, [[58, 40], [64, 48], [60, 50], [70, 50], [72, 52], [77, 44], [84, 34], [80, 40]], h('#e8e4f4'), false);
  paper(p, [[44, 92], [62, 66], [80, 92]], h('#4e4878'));
  // the prison: a tower and its wall at the peak
  paper(p, [[80, 34], [80, 16], [78, 16], [78, 13], [90, 13], [90, 16], [88, 16], [88, 34]], h('#3a3454'));
  p.rect(82, 20, 2, 3, FIRE);
  p.rect(85, 26, 2, 3, FIRE_HI);
  paper(p, [[70, 36], [70, 30], [80, 30], [80, 36]], h('#4a4468'));
  // the road down off the mountain, across the gutter, to the town
  paper(p, [[96, 92], [104, 88], [92, 84], [100, 80], [104, 80], [97, 84], [109, 88], [104, 94]], h('#c8b088'), false);
  p.poly([[104, 94], [109, 88], [150, 96], [146, 100]], h('#c8b088'));
  // trees along it
  for (const [tx, ty, s] of [[32, 98, 1], [118, 96, 0.8], [142, 98, 1], [160, 90, 0.7]] as const) {
    paper(p, [[tx, ty], [tx + 5 * s, ty - 14 * s], [tx + 10 * s, ty]], h('#2e6e3a'));
    p.rect(tx + 4 * s, ty, 2, 2, h('#6e4526'));
  }
  // RIGHT LEAF: the town in its walls, the bell tower
  paper(p, [[150, 96], [150, 80], [226, 80], [226, 96]], h('#5a4a68'));
  for (let x = 150; x < 226; x += 4) p.rect(x, 78, 2, 2, h('#5a4a68'));
  const houses: [number, number, number, C][] = [
    [156, 62, 14, h('#8a3a3a')],
    [172, 66, 12, h('#3a5a8a')],
    [200, 64, 13, h('#7a5a2a')],
    [214, 68, 10, h('#3a6a5a')],
  ];
  for (const [x, y, w, roof] of houses) {
    paper(p, [[x, 82], [x, y], [x + w, y], [x + w, 82]], h('#d8c8a8'));
    paper(p, [[x - 2, y + 1], [x + w / 2, y - 8], [x + w + 2, y + 1]], roof);
    p.rect(x + 3, y + 5, 2, 3, FIRE);
  }
  // the bell tower, the Muffled Bell in it
  paper(p, [[184, 82], [184, 38], [196, 38], [196, 82]], h('#c8b898'));
  paper(p, [[182, 39], [190, 26], [198, 39]], h('#4a3a6a'));
  p.rect(187, 44, 6, 7, h('#2a2034'));
  p.ellipse(190, 48, 2, 2, h('#b87a1c'));
  // the paper moon on a wire over the left leaf, and stars on threads
  p.line(46, 0, 46, 10, h('#6a6070'));
  p.ellipse(46, 16, 6, 6, (x, y) => (x + y < 60 ? h('#f4ecd0') : h('#d8ccaa')));
  p.ellipse(48, 15, 4, 5, h('#120e26'));
  for (const [sx, len] of [[120, 14], [150, 8], [220, 18], [236, 10], [100, 6]] as const) {
    p.line(sx, 0, sx, len, h('#4a4058'));
    p.sprite(sx - 2, len, ['..x..', '.xxx.', 'xxxxx', '.x.x.'], { x: h('#e8d080') });
  }
  // the little paper knight on the road
  p.sprite(124, 82, ['.h.', 'hhr', 'rrr', 'rRr', 'k.k'], { h: h('#b4c0d0'), r: h('#c02838'), R: h('#6e1020'), k: h('#2a2464') });
  // WORDS RISING off the pages like fireflies
  for (let i = 0; i < 34; i++) {
    const x = 26 + rnd(i, 1, 71) * 204;
    const y = 8 + rnd(i, 2, 71) * 84;
    p.glow(x, y, 4, 4, CY, 0.35, 2);
    if (rnd(i, 3, 71) > 0.6) p.rune(x - 1, y - 2, i, CY_HI);
    else p.set(x, y, CY_HI);
  }
}

// ---------------------------------------------------------------------------------------------
// 6. THE LAST FIRE BEFORE THE GATE: the three heroes from behind, round a fire at night, before the
// great gate of the dungeon in the cliff, eyes in the dark of it.

function paintCampfire(p: Pic): void {
  const FX = 128;
  const FY = 92;
  const firelit = (x: number, y: number): number => band(clamp01(1 - Math.hypot((x - FX) * 0.7, (y - FY) * 1.2) / 100), 6);
  const lit = (c: C, x: number, y: number, k = 1): C => {
    const f = firelit(x, y) * k;
    return mix(mix(h('#08060f'), c, 0.18 + 0.82 * f), FIRE, f * 0.2);
  };
  // a strip of night sky over the cliff
  p.vgrad(0, 30, [h('#0a0824'), h('#16123a')]);
  p.stars(0, 26, 8, 50);
  // the cliff face
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < TW; x++) {
      const top = 14 + noise1(x * 0.05, 3) * 14;
      if (y < top) continue;
      const crack = fbm(x * 0.14, y * 0.22, 7, 3);
      const ledge = Math.floor(y / 7 + noise1(x * 0.08, 9) * 2) % 3 === 0 && (y + Math.floor(noise1(x * 0.08, 9) * 14)) % 7 === 0;
      p.set(x, y, lit(ledge ? h('#4a4258') : crack > 0.64 ? h('#1e1a2c') : crack > 0.5 ? h('#342e44') : h('#2c2638'), x, y, 0.9));
    }
  }
  // THE GATE: a great arch, black inside, its teeth up, eyes in the dark
  const GX = 128;
  const GY = 40;
  const inside = (x: number, y: number, r: number): boolean => x >= GX - r && x <= GX + r && y <= 96 && (y >= GY || Math.hypot(x - GX, y - GY) <= r);
  for (let y = 10; y < 100; y++) {
    for (let x = GX - 46; x <= GX + 46; x++) {
      if (inside(x, y, 26)) p.set(x, y, h('#030208'));
      else if (inside(x, y, 34)) {
        const ang = Math.atan2(y - GY, x - GX);
        const block = y < GY ? Math.floor((ang + Math.PI) * 5) % 2 === 0 : Math.floor(y / 6) % 2 === 0;
        p.set(x, y, lit(block ? h('#4a4258') : h('#3a3448'), x, y, 1.1));
      }
    }
  }
  // the portcullis drawn up, its teeth hanging
  for (let x = GX - 24; x <= GX + 24; x += 6) {
    p.vline(x, GY - 20, GY + 4, h('#2e3440'));
    p.set(x, GY + 5, h('#4a5466'));
  }
  p.hline(GX - 25, GX + 25, GY + 2, h('#2e3440'));
  // eyes in the dark of it
  for (const [ex, ey] of [[118, 62], [137, 56], [126, 74], [144, 70], [108, 76]] as const) {
    p.glow(ex + 1, ey, 5, 3, PK, 0.35, 2);
    p.set(ex, ey, PK_HI);
    p.set(ex + 3, ey, PK_HI);
  }
  // a cult's banner, torn, by the gate
  p.poly([[76, 30], [88, 30], [88, 62], [85, 56], [82, 64], [79, 55], [76, 60]], (x, y) => lit(h('#3c1e62'), x, y));
  p.rune(81, 38, 3, PK);
  p.poly([[168, 30], [180, 30], [180, 56], [176, 50], [172, 58], [168, 52]], (x, y) => lit(h('#3c1e62'), x, y));
  p.rune(173, 38, 6, PK);
  // the ground
  for (let y = 96; y < TH; y++) for (let x = 0; x < TW; x++) p.set(x, y, lit(noise2(x * 0.2, y * 0.4, 2) > 0.6 ? h('#3a3040') : h('#2a2232'), x, y));
  // THE FIRE: logs, flames, embers going up
  p.glow(FX, FY - 4, 120, 50, FIRE, 0.4, 6);
  p.line(FX - 10, FY + 4, FX + 8, FY, h('#4a2c1a'));
  p.line(FX + 10, FY + 4, FX - 8, FY, h('#2d1b12'));
  p.poly([[FX - 8, FY + 2], [FX - 6, FY - 8], [FX - 2, FY - 4], [FX, FY - 16], [FX + 3, FY - 6], [FX + 6, FY - 10], [FX + 8, FY + 2]], FIRE);
  p.poly([[FX - 5, FY + 2], [FX - 2, FY - 6], [FX, FY - 10], [FX + 3, FY - 3], [FX + 5, FY + 2]], FIRE_HI);
  p.poly([[FX - 2, FY + 2], [FX, FY - 4], [FX + 2, FY + 2]], FIRE_WH);
  for (let i = 0; i < 16; i++) p.set(FX + (rnd(i, 1, 81) - 0.5) * 20, FY - 16 - rnd(i, 2, 81) * 40, rnd(i, 3, 81) > 0.5 ? FIRE_HI : FIRE);
  // THE THREE, from behind, lit at their edges by the fire.
  const rim = (pts: readonly Pt[], body: C, edge: C): void => {
    p.poly(pts, body);
    p.poly(pts.map(([x, y]) => [x + (x < FX ? 1 : -1), y + 1] as Pt), (x, y) => (p.get(x, y) === body ? -1 : -1));
  };
  void rim;
  // the ranger, crouched on the left, hood up, bow on his back
  const RG = h('#1e4a2a');
  const RGL = h('#3c7a3a');
  p.poly([[54, 118], [58, 98], [64, 88], [72, 86], [80, 92], [84, 118]], (x, y) => (x > 76 - (y - 86) * 0.1 ? RGL : RG));
  p.poly([[62, 90], [66, 80], [72, 78], [78, 82], [78, 90]], (x, y) => (x > 75 ? RGL : RG));
  p.line(78, 82, 79, 92, FIRE_HI);
  p.line(84, 96, 84, 118, FIRE);
  p.line(52, 84, 66, 116, h('#96643a'));
  p.line(53, 84, 67, 116, h('#4a2c1a'));
  // the knight, standing in the middle-left, his sword's point on the ground, scarf stirring
  const KR = h('#7a1424');
  const KRL = h('#c02838');
  p.poly([[94, 118], [96, 96], [92, 84], [100, 78], [116, 78], [122, 84], [118, 96], [120, 118]], (x, y) => (x > 116 - (y - 78) * 0.05 ? KRL : KR));
  // helm, its point
  p.poly([[100, 78], [102, 68], [108, 58], [114, 68], [116, 78]], (x, y) => (x > 110 ? h('#b4c0d0') : h('#4a5466')));
  p.line(113, 66, 116, 78, FIRE_HI);
  // the scarf
  p.poly([[100, 80], [116, 80], [116, 84], [100, 84]], h('#a81c2c'));
  p.poly([[100, 82], [92, 90], [88, 100], [94, 98], [98, 90]], h('#6e1020'));
  // the shield on his back
  p.poly([[98, 88], [114, 88], [114, 100], [106, 110], [98, 100]], h('#3a3478'));
  p.poly([[100, 90], [106, 96], [112, 90], [112, 92], [106, 98], [100, 92]], h('#e8b030'));
  // the sword at his right side, point down, its blade lit cyan
  p.line(123, 84, 123, 118, CY);
  p.line(124, 84, 124, 118, CY_HI);
  p.rect(120, 82, 7, 2, h('#b87a1c'));
  p.glow(124, 100, 8, 20, CY, 0.25, 3);
  // the mage, seated on a stone to the right, her hat, her staff and its stone lit cyan
  const MB = h('#1c3a86');
  const MBL = h('#2e6cc8');
  p.poly([[150, 112], [176, 112], [174, 106], [152, 106]], h('#3a3448'));
  p.poly([[152, 106], [154, 92], [160, 86], [168, 86], [172, 92], [174, 106]], (x, y) => (x < 156 + (y - 86) * 0.1 ? MBL : MB));
  p.poly([[148, 88], [180, 88], [172, 84], [156, 84]], (x, y) => (x < 158 ? MBL : MB));
  p.poly([[157, 85], [163, 66], [172, 60], [166, 70], [170, 85]], (x, y) => (x < 162 ? MBL : MB));
  p.line(156, 85, 163, 67, FIRE_HI);
  p.line(184, 70, 180, 118, h('#6e4526'));
  p.ellipse(184, 68, 3, 3, CY_HI);
  p.glow(184, 68, 12, 10, CY, 0.4, 3);
  // smoke going up past the gate
  for (let i = 0; i < 30; i++) {
    const y = FY - 20 - i * 2.2;
    const x = FX + Math.sin(i * 0.4) * (3 + i * 0.3);
    p.over(x, y, h('#4a4258'), 0.25);
    p.over(x + 1, y, h('#4a4258'), 0.15);
  }
}

// ---------------------------------------------------------------------------------------------
// 7. THE DOOR OF RUNES: a great round door sealed in the rock, its rings of runes; the knight at the
// top of the steps, his hand up, the outer ring lighting cyan to his word.

function paintRuneDoor(p: Pic): void {
  const DX = 128;
  const DY = 56;
  const cyanAt = (x: number, y: number): number => band(clamp01(1 - Math.hypot(x - DX, (y - DY) * 1.1) / 110), 6);
  const lit = (c: C, x: number, y: number, k = 1): C => {
    const l = cyanAt(x, y) * k;
    return mix(mix(h('#07060f'), c, 0.16 + 0.84 * l), CY, l * 0.12);
  };
  // the rock round it: dressed stone, carved
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const row = Math.floor(y / 9);
      const joint = y % 9 === 0 || (x + (row % 2) * 11) % 22 === 0;
      p.set(x, y, lit(joint ? h('#16121e') : noise2(x * 0.15, y * 0.15, 4) > 0.55 ? h('#3e3850') : h('#302a42'), x, y));
    }
  }
  // the door's frame and its rings
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const r = Math.hypot(x + 0.5 - DX, y + 0.5 - DY);
      if (r > 52) continue;
      const a = Math.atan2(y + 0.5 - DY, x + 0.5 - DX);
      let c: C;
      if (r > 47) c = r > 50 ? h('#5a5476') : h('#26203a');
      else if (r > 44) c = h('#1a1628');
      else if (r > 33) c = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 16) % 2 ? h('#4a4468') : h('#423c60');
      else if (r > 31) c = h('#1a1628');
      else if (r > 20) c = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 12 + 0.5) % 2 ? h('#3a3458') : h('#34304e');
      else if (r > 18) c = h('#1a1628');
      else c = h('#2e2a46');
      // light from the upper left on the rings' edges
      if ((r > 44 && r < 45.5) || (r > 31 && r < 32.2) || (r > 18 && r < 19.2)) c = x + y < DX + DY ? h('#1a1628') : h('#6a6490');
      p.set(x, y, lit(c, x, y, 1.1));
    }
  }
  // the outer ring's runes, burning cyan; the middle ring's waking; the inner ring's dark
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const x = DX + Math.cos(a) * 39 - 1;
    const y = DY + Math.sin(a) * 39 - 2;
    p.glow(x + 1, y + 2, 6, 6, CY, 0.4, 2);
    p.rune(x, y, i, CY_HI);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + 0.26;
    const x = DX + Math.cos(a) * 26 - 1;
    const y = DY + Math.sin(a) * 26 - 2;
    p.rune(x, y, i + 3, i < 5 ? CY : h('#1a1628'));
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    p.rune(DX + Math.cos(a) * 12 - 1, DY + Math.sin(a) * 12 - 2, i + 5, h('#16121e'));
  }
  // the seal at its heart, a slit of light where it will open
  p.ellipse(DX, DY, 7, 7, (x, y, n) => (n > 0.8 ? h('#16121e') : x + y < DX + DY ? h('#6a6490') : h('#4a4468')));
  p.vline(DX, DY - 5, DY + 5, CY_HI);
  p.glow(DX, DY, 10, 14, CY, 0.4, 3);
  // pillars either side, braziers on them (an honest flame)
  for (const px of [30, 206]) {
    p.rect(px, 20, 20, 82, lit(h('#3a3448'), px + 10, 60));
    p.rect(px, 20, 3, 82, lit(h('#5a5476'), px, 60));
    p.rect(px + 17, 20, 3, 82, lit(h('#26203a'), px + 18, 60));
    p.rect(px - 3, 16, 26, 5, lit(h('#5a5476'), px + 10, 18));
    p.poly([[px + 2, 16], [px + 18, 16], [px + 14, 10], [px + 6, 10]], h('#2e3440'));
    p.poly([[px + 6, 10], [px + 8, 2], [px + 10, 6], [px + 12, 0], [px + 14, 10]], FIRE);
    p.poly([[px + 8, 10], [px + 10, 4], [px + 12, 10]], FIRE_HI);
    p.glow(px + 10, 8, 40, 30, FIRE, 0.3, 4);
  }
  // the steps up to it
  for (let k = 0; k < 6; k++) {
    const y = 102 + k * 3;
    const half = 30 + k * 10;
    p.rect(DX - half, y, half * 2, 1, lit(h('#7a74a0'), DX, y));
    p.rect(DX - half, y + 1, half * 2, 2, lit(h('#3a3458'), DX, y));
  }
  // the knight at the top of them, his hand up to the door, his word in it
  p.glow(DX + 4, 92, 18, 14, CY, 0.35, 4);
  p.sprite(DX - 4, 90, KNIGHT_BACK, KNIGHT_KEY);
  p.line(DX + 4, 92, DX + 7, 86, h('#4a5466'));
  p.set(DX + 7, 85, CY_HI);
  p.line(DX + 8, 84, DX + 16, 72, CY, 0.6);
  // dust coming down off the door as it wakes
  for (let i = 0; i < 30; i++) p.add(DX + (rnd(i, 1, 91) - 0.5) * 110, rnd(i, 2, 91) * 100, h('#8a84c0'), 0.4);
}

// ---------------------------------------------------------------------------------------------
// 8. THE EYE IN THE STORM: the showdown. The Drowned Eye risen out of the fen in a storm, pink burning
// to gold; the knight small on a root before it, his blade up and blazing cyan.

function paintEye(p: Pic): void {
  p.vgrad(0, 80, [h('#0a0c18'), h('#141a2a'), h('#1e2436'), h('#2a2e40')]);
  // storm clouds, banded
  for (let y = 0; y < 76; y++) {
    for (let x = 0; x < TW; x++) {
      const c = fbm(x * 0.02, y * 0.05, 13, 4);
      if (c > 0.45) p.set(x, y, c > 0.62 ? h('#3a3e58') : c > 0.53 ? h('#2a2e46') : h('#1e2236'));
    }
  }
  // the lightning, and the sky lit behind it
  const bolt: Pt[] = [[44, 0], [50, 14], [44, 22], [54, 36], [48, 46], [58, 62]];
  p.glow(50, 30, 40, 40, h('#8a84d0'), 0.25, 3);
  for (let i = 0; i + 1 < bolt.length; i++) {
    p.line(bolt[i][0], bolt[i][1], bolt[i + 1][0], bolt[i + 1][1], WHITE);
    p.line(bolt[i][0] + 1, bolt[i][1], bolt[i + 1][0] + 1, bolt[i + 1][1], h('#c8c0ff'));
  }
  p.line(44, 22, 34, 30, h('#c8c0ff'));
  // far dead trees in the mist
  for (const [tx, ht] of [[10, 34], [26, 22], [214, 30], [236, 40], [250, 24]] as const) {
    p.line(tx, 80, tx, 80 - ht, h('#262a3c'));
    p.line(tx, 80 - ht * 0.6, tx - 6, 80 - ht * 0.8, h('#262a3c'));
    p.line(tx, 80 - ht * 0.4, tx + 7, 80 - ht * 0.7, h('#262a3c'));
  }
  // the fen's water: dark, the rain on it
  for (let y = 80; y < TH; y++) for (let x = 0; x < TW; x++) p.set(x, y, (y - 80) % 5 === 0 && rnd(x >> 3, y, 2) > 0.5 ? h('#1e2234') : h('#12141f'));
  // THE EYE, risen out of the water
  const EX = 164;
  const EY = 52;
  const ER = 30;
  // its arms up out of the water round it
  const arm = (x0: number, dir: number, ht: number, curl: number): void => {
    for (let i = 0; i < ht; i++) {
      const t = i / ht;
      const w = 5 * (1 - t) + 1;
      const x = x0 + Math.sin(t * Math.PI * curl) * 10 * dir;
      const y = 84 - i;
      for (let k = -w; k <= w; k++) p.set(x + k, y, k < -w + 2 ? h('#c8b8d8') : k > w - 2 ? h('#5a4a6e') : h('#8a789e'));
      if (i % 5 === 0) p.set(x + w * 0.4 * dir, y, h('#e0287a'));
    }
  };
  arm(118, -1, 50, 0.8);
  arm(206, 1, 56, 0.9);
  arm(132, -1, 30, 0.5);
  arm(196, 1, 34, 0.6);
  // the flesh cupping it
  p.ellipse(EX, EY + 12, ER + 8, ER - 4, (x, y, n) => (n > 0.9 ? h('#3a2a4a') : y > EY + 20 ? h('#4a3a5e') : h('#6a587e')));
  // the white of it, veined with the fen's violet
  p.ellipse(EX, EY, ER, ER - 4, (x, y, n) => (n > 0.9 ? h('#a89ab8') : x + y < EX + EY - 10 ? h('#f0e8f4') : h('#d0c4dc')));
  for (let v = 0; v < 11; v++) {
    const a = (v / 11) * Math.PI * 2 + 0.3;
    let x = EX + Math.cos(a) * (ER - 2);
    let y = EY + Math.sin(a) * (ER - 6);
    for (let k = 0; k < 9; k++) {
      const nx = x + (EX - 4 - x) * 0.09 + (rnd(v, k, 3) - 0.5) * 3;
      const ny = y + (EY + 2 - y) * 0.09 + (rnd(v, k, 4) - 0.5) * 3;
      p.line(x, y, nx, ny, h('#b0608e'));
      x = nx;
      y = ny;
    }
  }
  // the iris, pink at its rim burning to gold, the slit
  p.ellipse(EX - 4, EY + 2, 15, 14, (x, y, n) => (n > 0.8 ? PK : n > 0.55 ? PK_HI : n > 0.3 ? h('#ffb060') : GOLD));
  p.ellipse(EX - 4, EY + 2, 3, 12, h('#0a0410'));
  p.set(EX - 9, EY - 4, WHITE);
  p.set(EX - 8, EY - 4, WHITE);
  p.set(EX - 9, EY - 3, WHITE);
  // its brow scowling over it
  const brow: Pt[] = [];
  for (let k = 0; k <= 16; k++) {
    const a = Math.PI * (1.08 + (k / 16) * 0.84);
    const dip = Math.exp(-Math.pow((k - 7) / 3.2, 2)) * 7;
    brow.push([EX + Math.cos(a) * (ER + 1), EY + Math.sin(a) * (ER - 3) + dip]);
  }
  for (let k = 16; k >= 0; k--) {
    const a = Math.PI * (1.04 + (k / 16) * 0.92);
    brow.push([EX + Math.cos(a) * (ER + 7), EY + Math.sin(a) * (ER + 4)]);
  }
  p.poly(brow, (x, y) => (y < EY - ER + 2 ? h('#7a6890') : h('#4a3a5e')));
  for (let k = 0; k + 1 <= 16; k++) p.line(brow[k][0], brow[k][1], brow[k + 1][0], brow[k + 1][1], h('#2a1a36'));
  p.glow(EX - 4, EY + 2, 70, 50, PK, 0.25, 5);
  // its light on the water, broken by the rain
  for (let y = 84; y < TH; y += 2) {
    const w = 16 - (y - 84) * 0.25;
    for (let x = EX - 4 - w; x < EX - 4 + w; x++) if (rnd(x, y, 9) > 0.35) p.set(x, y, y % 4 === 0 ? PK : h('#7a1058'));
  }
  // THE KNIGHT on a root at the left, his blade up, blazing
  p.poly([[0, 118], [0, 98], [30, 92], [56, 94], [72, 104], [84, 118]], h('#0a0a12'));
  p.line(30, 92, 56, 94, h('#3a3e58'));
  p.poly([[40, 96], [48, 82], [52, 84], [46, 96]], h('#14141e'));
  p.sprite(36, 82, KNIGHT_BACK, KNIGHT_KEY);
  p.rect(41, 84, 6, 1, h('#b87a1c'));
  p.line(44, 83, 49, 58, CY);
  p.line(45, 83, 50, 58, CY_HI);
  p.line(46, 83, 51, 59, CY);
  p.set(50, 57, WHITE);
  p.glow(47, 70, 18, 26, CY, 0.4, 4);
  for (let i = 0; i < 8; i++) p.set(47 + (rnd(i, 1, 7) - 0.5) * 18, 58 + rnd(i, 2, 7) * 26, CY_HI);
  // rain over all of it
  for (let i = 0; i < 260; i++) {
    const x = rnd(i, 1, 101) * (TW + 30);
    const y = rnd(i, 2, 101) * TH;
    p.line(x, y, x - 2, y + 4, h('#5a6488'), 0.6);
  }
}

// ---------------------------------------------------------------------------------------------
// 9. THE RING ON THE HILL: calm before it all. The wordsmith's ring of standing stones on a hill under
// a great sky, its runes burning, a column of light going up off his slab, letters in the sky.

function paintRing(p: Pic): void {
  p.vgrad(0, TH, [h('#060818'), h('#0a1028'), h('#0e1a36'), h('#14223e'), h('#1a2440')]);
  // the river of stars across the sky
  for (let y = 0; y < 70; y++) {
    for (let x = 0; x < TW; x++) {
      const d = Math.abs(y - (60 - x * 0.22)) / 18;
      if (d < 1 && fbm(x * 0.05, y * 0.08, 21, 3) > 0.45 + d * 0.2) p.over(x, y, h('#3a4278'), 0.4 * band(1 - d, 3));
    }
  }
  p.stars(0, 80, 17, 220);
  // THE AURORA: curtains of the friend's light, and letters in it
  for (let x = 0; x < TW; x++) {
    const top = 14 + noise1(x * 0.03, 5) * 22;
    const len = 10 + noise1(x * 0.05, 6) * 22;
    for (let y = Math.floor(top); y < top + len; y++) {
      const t = (y - top) / len;
      const k = band((1 - t) * (0.5 + 0.5 * noise1(x * 0.25, 7)), 4);
      p.add(x, y, t > 0.7 ? h('#0c6a80') : h('#157a8c'), k * 0.5);
    }
    if (rnd(x, 3, 23) > 0.9) p.add(x, top + len * 0.3, CY_HI, 0.6);
  }
  for (let i = 0; i < 14; i++) p.rune(10 + rnd(i, 1, 29) * 236, 18 + rnd(i, 2, 29) * 24, i, mix(h('#14223e'), CY, 0.6));
  // far hills, the near hill
  for (let x = 0; x < TW; x++) {
    const a = ridge(x, 92, 14, 0.03, 31);
    for (let y = Math.floor(a); y < TH; y++) p.set(x, y, y < a + 1 ? h('#2a3458') : h('#161c34'));
  }
  // mist in the valleys
  for (let y = 88; y < 100; y++) for (let x = 0; x < TW; x++) if (bay(x, y) < 0.25 * (1 - Math.abs(y - 94) / 6)) p.set(x, y, h('#3a4470'));
  const HX = 128;
  for (let x = 0; x < TW; x++) {
    const top = 84 + Math.pow(Math.abs(x - HX) / 128, 1.6) * 40;
    for (let y = Math.floor(top); y < TH; y++) p.set(x, y, y < top + 1 ? h('#2e3a5a') : (x * 7 + y * 3) % 19 === 0 ? h('#141a2e') : h('#0e1424'));
  }
  // THE COLUMN OF LIGHT off the slab, letters climbing it
  for (let y = 0; y < 84; y++) {
    const w = 3 + (84 - y) * 0.02;
    for (let x = HX - w - 3; x <= HX + w + 3; x++) {
      const d = Math.abs(x - HX);
      p.add(x, y, d < w * 0.4 ? CY_HI : d < w ? CY : CY_LO, d < w ? 0.6 : 0.35);
    }
  }
  for (let i = 0; i < 9; i++) p.rune(HX - 1, 8 + i * 8, i * 2, WHITE);
  p.glow(HX, 84, 70, 22, CY, 0.4, 5);
  // THE RING: twelve stones round the slab, the far ones small, each with its rune
  const stones: { x: number; y: number; s: number; i: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    stones.push({ x: HX + Math.cos(a) * 48, y: 86 + Math.sin(a) * 9, s: 0.75 + (Math.sin(a) + 1) * 0.2, i });
  }
  stones.sort((a, b) => a.y - b.y);
  // the slab, in the middle, behind the near stones
  p.poly([[HX - 9, 86], [HX + 9, 86], [HX + 7, 90], [HX - 7, 90]], h('#6a74a0'));
  p.hline(HX - 9, HX + 9, 86, h('#b8fff8'));
  for (const st of stones) {
    if (st.y > 86) continue;
    standing(p, st.x, st.y, st.s, st.i, HX);
  }
  // the wordsmith, small, by the slab, his staff, his cowl teal
  p.sprite(HX + 10, 72, [
    '..TT...',
    '.TTTT..',
    'TTwbwT.',
    'TTwwwT.',
    '.NwwwNs',
    '.NNwNNs',
    '.NNNNNs',
    '.NNNNNs',
    '.NNNNNs',
    'NNNNNNs',
    'NNNNNNs',
    '.n..n.s',
  ], { T: h('#157a8c'), w: h('#f0e8ff'), b: CY_HI, N: h('#1c2a6a'), n: h('#0c0a20'), s: h('#96643a') });
  p.set(HX + 16, 71, CY_HI);
  for (const st of stones) {
    if (st.y <= 86) continue;
    standing(p, st.x, st.y, st.s, st.i, HX);
  }
}

function standing(p: Pic, x: number, y: number, s: number, i: number, hx: number): void {
  const w = Math.round(7 * s);
  const ht = Math.round(20 * s + (i % 3) * 2);
  const lean = (i % 2 ? 1 : -1) * 1;
  const facesLight = x > hx;
  p.ellipse(x, y + 1, w * 0.8, 1.5, h('#0a0e1c'));
  p.poly([[x - w / 2, y], [x - w / 2 + lean, y - ht], [x + w / 2 + lean, y - ht - 2], [x + w / 2, y]], (px, py) => {
    const towardRing = facesLight ? px < x : px > x;
    return towardRing ? h('#5a6a94') : h('#2e3658');
  });
  p.line(x - w / 2 + lean, y - ht, x + w / 2 + lean, y - ht - 2, h('#7a88b0'));
  p.rune(x - 1 + lean / 2, y - ht * 0.6, i, CY_HI);
  p.glow(x + lean / 2, y - ht * 0.6 + 2, 6, 6, CY, 0.35, 2);
}

// ---------------------------------------------------------------------------------------------
// 10. THE QUILL OVER THE CITY: the name of the game written across the night sky over the city's
// roofs and bell towers by a great quill, in the friend's light, ink falling as stars.

function paintQuill(p: Pic): void {
  p.vgrad(0, TH, [h('#08061a'), h('#100c2a'), h('#1a1438'), h('#281a44')]);
  p.stars(0, 70, 33, 120);
  // the moon, low, big, behind the towers
  p.haze(208, 66, 36, 36, h('#3a3070'), 0.35, 4);
  p.ellipse(208, 66, 20, 20, (x, y) => (x + y < 268 ? h('#ece4ff') : h('#c8c0e8')));
  p.ellipse(214, 60, 3, 3, h('#bab0dc'));
  p.ellipse(200, 72, 4, 3, h('#bab0dc'));
  // the city: three rows of roofs, the far ones pale with the mist
  const row = (base: number, c: C, seed: number, tall: number): void => {
    let x = -4;
    let i = 0;
    while (x < TW) {
      const w = 8 + Math.floor(rnd(i, 1, seed) * 12);
      const ht = 6 + Math.floor(rnd(i, 2, seed) * tall);
      const top = base - ht;
      const gable = rnd(i, 3, seed) > 0.4;
      p.rect(x, top, w, TH - top, c);
      if (gable) p.poly([[x - 1, top], [x + w / 2, top - w * 0.55], [x + w + 1, top]], c);
      if (rnd(i, 4, seed) > 0.6) p.rect(x + 2, top - (gable ? w * 0.5 : 0) - 4, 2, 5, c);
      if (rnd(i, 5, seed) > 0.85) {
        // a bell tower
        p.rect(x + w / 2 - 3, top - 22, 6, 22, c);
        p.poly([[x + w / 2 - 4, top - 22], [x + w / 2, top - 32], [x + w / 2 + 4, top - 22]], c);
      }
      for (let k = 0; k < 3; k++) if (rnd(i, 6 + k, seed) > 0.55) p.set(x + 2 + k * 3, top + 3 + k, rnd(i, 9 + k, seed) > 0.5 ? FIRE_HI : FIRE);
      x += w + (rnd(i, 7, seed) > 0.7 ? 2 : 0);
      i++;
    }
  };
  row(96, h('#2a2050'), 41, 14);
  for (let y = 84; y < 96; y++) for (let x = 0; x < TW; x++) if (bay(x, y) < 0.2) p.set(x, y, h('#4a3a78'));
  row(106, h('#18122e'), 42, 16);
  row(118, h('#0c0a18'), 43, 12);
  // THE NAME, written across the sky in light
  const cv = document.createElement('canvas');
  cv.width = TW;
  cv.height = 40;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  drawText(g, 'WORDSMITH', 18, 18, '#ffffff', { scale: 3 });
  const im = g.getImageData(0, 0, TW, 40).data;
  const WY = 16;
  const lit: Pt[] = [];
  for (let y = 0; y < 40; y++) for (let x = 0; x < TW; x++) if (im[(y * TW + x) * 4 + 3] > 128) lit.push([x, y + WY + Math.round(Math.sin(x * 0.05) * 3)]);
  for (const [x, y] of lit) p.glow(x, y, 4, 4, CY, 0.12, 2);
  for (const [x, y] of lit) {
    p.set(x, y, CY_HI);
    p.add(x, y + 1, CY, 0.4);
  }
  let ex = 0;
  for (const [x] of lit) ex = Math.max(ex, x);
  // a flourish trailing off the last letter to the nib
  const NX = ex + 22;
  const NY = WY + 26;
  p.line(ex, WY + 26, NX, NY, CY_HI);
  p.line(ex, WY + 27, NX, NY + 1, CY);
  // THE QUILL: a great white feather, curved, its steel nib on the end of the line
  const dx = 0.78;
  const dy = -0.63;
  const L = 66;
  const at = (t: number): Pt => [NX + 4 + dx * L * t + 6 * Math.sin(t * Math.PI) * 0.83, NY - 6 + dy * L * t + 6 * Math.sin(t * Math.PI) * 0.55];
  for (let t = 0.14; t <= 1; t += 0.004) {
    const [x, y] = at(t);
    const u = (t - 0.14) / 0.86;
    const wl = 12 * Math.sin(Math.min(1, u * 1.15) * Math.PI * 0.95) * (u < 0.08 ? u / 0.08 : 1);
    const wr = wl * 0.55;
    // barbs swept back toward the quill's end
    for (let k = 1; k <= wl; k += 0.5) p.set(x - 0.83 * k - dx * k * 0.5, y - 0.55 * k - dy * k * 0.5, Math.floor(t * 120) % 4 === 0 ? h('#b8b0d8') : k > wl - 1.5 ? h('#d8d0f0') : h('#f6f2ff'));
    for (let k = 1; k <= wr; k += 0.5) p.set(x + 0.83 * k - dx * k * 0.5, y + 0.55 * k - dy * k * 0.5, Math.floor(t * 120) % 4 === 0 ? h('#7a70a8') : h('#a8a0cc'));
  }
  for (let t = 0; t <= 1; t += 0.004) {
    const [x, y] = at(t);
    p.set(x, y, t < 0.14 ? h('#e8e0c8') : WHITE);
  }
  p.poly([[NX - 2, NY + 2], [NX + 2, NY - 8], [NX + 8, NY - 4]], (x, y) => (x + y < NX + NY - 3 ? h('#e6edf5') : h('#7a879c')));
  p.line(NX - 2, NY + 2, NX + 5, NY - 6, h('#2e3440'));
  p.glow(NX, NY + 1, 12, 9, CY, 0.55, 3);
  // ink falling off it as stars of light over the roofs
  for (let i = 0; i < 18; i++) {
    const x = 20 + rnd(i, 1, 111) * 220;
    const y = 40 + rnd(i, 2, 111) * 44;
    p.set(x, y, CY_HI);
    p.add(x, y - 1, CY, 0.5);
    p.add(x, y - 2, CY, 0.25);
  }
}

export const TITLE_OPTIONS: TitleOption[] = [
  {
    n: 1,
    name: 'ASLEEP IN THE LIBRARY',
    life: 'He breathes; the lamp flickers; letters drift up out of the book; the knight climbs the stair to the door.',
    paint: paintLibrary,
  },
  {
    n: 2,
    name: 'THE FORGE OF WORDS',
    life: 'The hammer comes down every few seconds: a flash, the screen kicks, sparks fly off as letters; the forge breathes.',
    paint: paintForge,
  },
  {
    n: 3,
    name: 'ABOVE THE BESIEGED TOWN',
    life: 'His scarf and the clouds on the wind; the dome pulses, fire crawling over it; the town\'s lights flicker.',
    paint: paintCliff,
  },
  {
    n: 4,
    name: 'THE DESCENT',
    life: 'Torches flicker all the way down; dust falls; the glow at the bottom breathes, and its eyes open.',
    paint: paintDescent,
  },
  {
    n: 5,
    name: 'THE STORYBOOK',
    life: 'Words rise off the pages like fireflies; the paper moon and stars swing on their threads; the little knight walks the road.',
    paint: paintStorybook,
  },
  {
    n: 6,
    name: 'THE LAST FIRE',
    life: 'The fire flickers and throws sparks; their capes and the scarf stir; eyes open and close in the dark of the gate.',
    paint: paintCampfire,
  },
  {
    n: 7,
    name: 'THE DOOR OF RUNES',
    life: 'The rings turn like a lock, rune after rune lighting under his word; dust falls; the slit at its heart widens.',
    paint: paintRuneDoor,
  },
  {
    n: 8,
    name: 'THE EYE IN THE STORM',
    life: 'Lightning cracks and lights it all; the Eye looks about and fixes on you; rain sweeps; his blade blazes brighter.',
    paint: paintEye,
  },
  {
    n: 9,
    name: 'THE RING ON THE HILL',
    life: 'The aurora ripples, letters climbing the column; the runes in the stones pulse in turn; the wordsmith\'s cowl stirs.',
    paint: paintRing,
  },
  {
    n: 10,
    name: 'THE QUILL OVER THE CITY',
    life: 'The quill writes the name across the sky as the screen opens; ink falls as sparks; windows light and go dark.',
    ownTitle: true,
    paint: paintQuill,
  },
];

void [TH, fbm, noise1, ridge, GOLD, FIRE, FIRE_HI, WHITE, CY_LO, mix];
