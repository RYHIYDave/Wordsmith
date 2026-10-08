// Dev-only preview of the pixel fonts (and a smoke test of the sound effects).
//   node tools/preview.mjs src/dev/preview_font.ts shots/font.png 1300 820
// Draws every glyph and every drawText option on a 320x200 canvas shown at 4x.

import { P, RARITY_COLOR } from '../art/palette';
import { initAudio, sfx, type Sfx } from '../engine/audio';
import { drawText, LINE_H, textWidth, wrapText } from '../engine/font';
import { ready } from './sheet';

const W = 320;
const H = 200;

// (two picture pixels to a game pixel, as the game's own screen holds: the letters are drawn at
// that grain since Version 13. `#coarse` shows them as they were, one pixel to a game pixel.)
const RES = location.hash === '#coarse' ? 1 : 2;
const cv = document.createElement('canvas');
cv.width = W * RES;
cv.height = H * RES;
cv.style.width = `${W * 4}px`;
cv.style.height = `${H * 4}px`;
cv.style.imageRendering = 'pixelated';
cv.style.position = 'static';
document.body.appendChild(cv);

const g = cv.getContext('2d')!;
g.setTransform(RES, 0, 0, RES, 0, 0);
g.imageSmoothingEnabled = false;
g.fillStyle = P.st1;
g.fillRect(0, 0, W, H);

/** All characters with codes from..to inclusive. */
function charRange(from: number, to: number): string {
  let s = '';
  for (let c = from; c <= to; c++) s += String.fromCharCode(c);
  return s;
}

// ---------------------------------------------------------------------------------------------
// Top: character sets

// the full 'normal' character set on two lines
let y = 2;
drawText(g, charRange(32, 79), 4, y, P.bn4);
y += LINE_H.normal;
drawText(g, charRange(80, 126), 4, y, P.bn4);
y += LINE_H.normal + 2;

// pangram, upper and lower case
const pangram = 'The quick brown fox jumps over the lazy dog';
drawText(g, pangram.toUpperCase(), 4, y, P.sl5);
y += LINE_H.normal;
drawText(g, pangram.toLowerCase(), 4, y, P.sl5);
y += LINE_H.normal + 2;

// the full 'small' character set, then lower-case input and a lone x (drawn as a multiply sign)
drawText(g, "ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 +-%.,:!?/'()x", 4, y, P.gd4, { font: 'small' });
y += LINE_H.small + 1;
drawText(g, 'the quick brown fox x3 max 1,234 crit! 50% (lvl 12) 3/4 +7 -2 equip 7th', 4, y, P.tl4, { font: 'small' });
y += LINE_H.small + 3;

// digits in both fonts, and the look-alike pairs side by side
drawText(g, '0123456789', 4, y, P.white);
drawText(g, '0123456789', 70, y + 2, P.white, { font: 'small' });
drawText(g, '0O 1lI 5S 8B 2Z 6G', 116, y, P.fr5);
drawText(g, '0O 1I 5S 8B 2Z 6G UV 7T HK', 214, y + 2, P.fr5, { font: 'small' });
y += LINE_H.normal + 3;

const columnsTop = y;

// ---------------------------------------------------------------------------------------------
// Left column: wrapping, unknown characters, measuring, the small font scaled up

// a paragraph wrapped to 150 px (the box shows the limit)
const story =
  'The Warden of the vault guards 1,250 gold and a sword of "quiet" embers.\n' +
  'Its keeper asks: what burns, yet never dies? (Type-set at 150 px.)';
const lines = wrapText(story, 150);
g.fillStyle = P.st2;
g.fillRect(3, y - 1, 152, lines.length * LINE_H.normal + 1);
for (const line of lines) {
  drawText(g, line, 4, y, P.bn3);
  y += LINE_H.normal;
}
y += 2;
for (const line of wrapText('small font wrapped to 150 px: +12% fire damage, 3/4 charges, x2 gold!', 150, 'small')) {
  drawText(g, line, 4, y, P.st7, { font: 'small' });
  y += LINE_H.small;
}
y += 3;

// characters without a glyph draw as '?'; curly quotes, dashes and the ellipsis have look-alikes
drawText(g, 'No glyph: \u00e9 \u2603 \t', 4, y, P.st7);
y += LINE_H.normal;
drawText(g, 'Alike: \u2018a\u2019 \u201cb\u201d 1\u20132 2\u00d73 wait\u2026', 4, y, P.st7);
y += LINE_H.normal + 1;

// textWidth must agree with what drawText reports (the bar underneath is textWidth wide)
const probe = 'Width: 0123 WMwm ilj.,';
const drawn = drawText(g, probe, 4, y, P.gn4);
g.fillStyle = P.gn2;
g.fillRect(4, y + LINE_H.normal - 1, textWidth(probe), 1);
if (drawn !== textWidth(probe)) console.error(`textWidth mismatch: drew ${drawn}, measured ${textWidth(probe)}`);
y += LINE_H.normal + 3;

// small-font damage numbers at scale 2 with a shadow
drawText(g, '125', 4, y, P.white, { font: 'small', scale: 2, shadow: P.ink });
drawText(g, 'CRIT x2!', 38, y, P.gd4, { font: 'small', scale: 2, shadow: P.ink });
drawText(g, '-48', 152, y, P.bl4, { font: 'small', scale: 2, shadow: P.ink, align: 'right' });

// ---------------------------------------------------------------------------------------------
// Right column: colours, alignment, shadow, scale

const colX = 164;
const boxR = W - 4;
let ry = columnsTop;

const rarities = ['Worn Short Sword', 'Sturdy Axe of the Bear', 'Grim Fang', 'Emberheart, the Last Coal'];
for (let i = 0; i < rarities.length; i++) {
  drawText(g, rarities[i], colX, ry, RARITY_COLOR[i]);
  ry += LINE_H.normal;
}
drawText(g, '+12% Fire', colX, ry, P.fr4);
drawText(g, '+8 Frost', colX + 54, ry, P.bu4);
drawText(g, '-5 Mana', colX + 104, ry, P.pu5);
ry += LINE_H.normal + 3;

// alignment: the red line is x for the centred text, the box edges are x for left and right
const midX = (colX + boxR) / 2;
g.fillStyle = P.st3;
g.fillRect(colX, ry - 1, boxR - colX, 3 * LINE_H.normal + 1);
g.fillStyle = P.bl4;
g.fillRect(midX, ry - 1, 1, 3 * LINE_H.normal + 1);
drawText(g, 'left edge', colX, ry, P.white);
drawText(g, 'centred on the line', midX, ry + LINE_H.normal, P.white, { align: 'center' });
drawText(g, 'right edge', boxR, ry + 2 * LINE_H.normal, P.white, { align: 'right' });
ry += 3 * LINE_H.normal + 4;

// shadow, on a mid-tone panel where plain text would be hard to read
g.fillStyle = P.st5;
g.fillRect(colX, ry - 1, boxR - colX, LINE_H.normal + 2);
drawText(g, 'Shadowed text', colX + 2, ry, P.gd4, { shadow: P.ink });
drawText(g, 'LVL 12', boxR - 2, ry + 2, P.white, { font: 'small', shadow: P.ink, align: 'right' });
ry += LINE_H.normal + 5;

// scale 2, with and without a shadow
drawText(g, 'Wordsmith', colX, ry, P.fr5, { scale: 2, shadow: P.fr1 });
ry += 2 * LINE_H.normal + 2;
drawText(g, 'Depth 3', boxR, ry, P.bu5, { scale: 2, align: 'right' });
drawText(g, 'scale 2', colX, ry + 6, P.st6);

// ---------------------------------------------------------------------------------------------
// Sound effects: one call per name; any failure is logged. (The Record makes the compiler
// complain here if a name is added to Sfx and forgotten in this list.)

const ALL_SFX: Record<Sfx, true> = {
  swing: true, hit: true, crit: true, shot: true, orb: true, nova: true, slam: true, trapSet: true, trapBoom: true,
  fire: true, frost: true, zap: true, explode: true, hurt: true, death: true, monsterDie: true, bossRoar: true,
  pickup: true, gold: true, word: true, rare: true, levelUp: true, potion: true, portal: true, click: true,
  equip: true, deny: true, dodge: true, imbue: true, buy: true, power: true,
  gust: true, echo: true, leech: true, rune: true, shatter: true, thunder: true, might: true,
  wave: true, orbSet: true, beam: true, beamHum: true, whirl: true, familiar: true, familiarShot: true,
  volley: true, arrowLand: true,
  door: true, gateFall: true, gateRise: true,
};
try {
  initAudio();
  for (const name of Object.keys(ALL_SFX) as Sfx[]) sfx(name);
} catch (err) {
  console.error('sound effects failed', err);
}

ready();
