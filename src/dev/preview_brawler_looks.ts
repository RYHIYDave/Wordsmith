// Dev page: THE BRAWLER REWORKED, TWENTY ROUGH LOOKS (dev/sculpt_brawler_looks.ts; the owner, 2 Nov 2026: “Give me some
// possible looks, 10 for each”). NOT IN THE GAME: pictures for him to choose from. Each look standing, from in front (the
// game's three-quarter view), three times the game's size, beside the knight.
//   node tools/preview.mjs src/dev/preview_brawler_looks.ts docs/mockups/brawler_looks/pictures/boxers_sheet.png 1200 100 boxers
//   hash = boxers | fighters
import { paintMove3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { Px } from '../engine/px';
import { sculptBrawler } from './sculpt_classes';
import { OLD_BOXERS, REAL_FIGHTERS, sculptLook } from './sculpt_brawler_looks';

const which = decodeURIComponent(location.hash.slice(1)) === 'fighters' ? 'fighters' : 'boxers';
const S = 3;
const W = 1200;
const BG = '#17142e';
const PANEL = ['#262354', '#211e4b'];
const GOLD = '#ffd866';
const TEXT = '#e4e0ff';
const SOFT = '#a8a2d8';
const UP = 84;
const DOWN = 12;
const KHALF = 26;
const LHALF = 34;

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let line = '';
  for (const wd of words) {
    const tryL = line ? `${line} ${wd}` : wd;
    if (g.measureText(tryL).width > maxW && line) {
      out.push(line);
      line = wd;
    } else line = tryL;
  }
  if (line) out.push(line);
  return out;
}

const build = (): void => {
  const knight = paintMove3(MOVES3.ktown, 0, 'front').px;
  const looks = which === 'boxers' ? OLD_BOXERS : REAL_FIGHTERS;
  const figs = looks.map((l) => sculptLook(l, 'front').px);
  const today = which === 'boxers' ? sculptBrawler('front').px : null;
  const figH = (UP + DOWN) * S;
  const ROW = figH + 16;
  const HEAD = today ? 64 + figH + 20 : 96;
  const cv = document.createElement('canvas');
  for (const el of [document.documentElement, document.body]) {
    el.style.height = 'auto';
    el.style.overflow = 'visible';
  }
  document.body.style.margin = '0';
  document.body.style.background = BG;
  cv.style.display = 'block';
  document.body.appendChild(cv);
  cv.width = W;
  cv.height = HEAD + looks.length * ROW + 10;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  const put = (px: Px, half: number, x: number, y: number): void => {
    // (its feet on the floor at UP down the pane; cropped to `half` either side of them)
    g.drawImage(px.toCanvas(), CANVAS3.ax - half, CANVAS3.ay - UP, half * 2, UP + DOWN, x, y, half * 2 * S, (UP + DOWN) * S);
  };
  const floor = (x: number, y: number, w: number): void => {
    g.strokeStyle = '#34306c';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y + UP * S + 1);
    g.lineTo(x + w, y + UP * S + 1);
    g.stroke();
  };
  g.textBaseline = 'top';
  g.fillStyle = GOLD;
  g.font = '800 30px system-ui, sans-serif';
  g.fillText(which === 'boxers' ? 'The Brawler reworked: 10 old-timey boxers' : 'The Brawler reworked: 10 real fighters (punch, kick, leap)', 16, 14);
  g.fillStyle = SOFT;
  g.font = '500 19px system-ui, sans-serif';
  g.fillText('Rough ideas, standing, 3 times the game size, each beside the knight. Not in the game.', 16, 52);
  if (today) {
    const y = 86;
    g.fillStyle = PANEL[1];
    g.fillRect(10, y, W - 20, figH);
    put(knight, KHALF, 20, y);
    put(today, LHALF, 20 + KHALF * 2 * S + 6, y);
    floor(16, y, KHALF * 2 * S + LHALF * 2 * S + 14);
    g.fillStyle = GOLD;
    g.font = '800 24px system-ui, sans-serif';
    g.fillText('For comparison: the Brawler as he is today', 20 + (KHALF + LHALF) * 2 * S + 30, y + 24);
    g.fillStyle = TEXT;
    g.font = '500 21px system-ui, sans-serif';
    wrap(g, 'Bald, the yellow spade beard, wrapped fists, the long coat over the studded jerkin (beside the knight).', 560).forEach((ln, i) => g.fillText(ln, 20 + (KHALF + LHALF) * 2 * S + 30, y + 64 + i * 28));
  }
  looks.forEach((look, i) => {
    const y = HEAD + i * ROW;
    g.fillStyle = PANEL[i % 2];
    g.fillRect(10, y, W - 20, figH);
    const fx = 70;
    put(knight, KHALF, fx, y);
    put(figs[i], LHALF, fx + KHALF * 2 * S + 6, y);
    floor(fx - 4, y, KHALF * 2 * S + LHALF * 2 * S + 14);
    g.fillStyle = GOLD;
    g.font = '900 44px system-ui, sans-serif';
    g.fillText(String(look.n), 18, y + 14);
    const tx = fx + (KHALF + LHALF) * 2 * S + 26;
    g.font = '800 30px system-ui, sans-serif';
    g.fillText(look.name, tx, y + 22);
    g.fillStyle = TEXT;
    g.font = '500 23px system-ui, sans-serif';
    wrap(g, look.line, W - tx - 24).forEach((ln, k) => g.fillText(ln, tx, y + 70 + k * 31));
    g.fillStyle = SOFT;
    g.font = '500 15px system-ui, sans-serif';
    g.fillText('the knight', fx + 20, y + figH - 22);
  });
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(build, 50);
else window.addEventListener('load', () => setTimeout(build, 50));
