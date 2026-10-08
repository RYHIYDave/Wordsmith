// Dev preview: ten different looks for the mage, in the colours of the chosen art style.
//   node tools/preview.mjs src/dev/preview_options_mage.ts previews/options_mage.png 1500 1596
// Add #only=3 for one design alone at 8x, or #half=1 / #half=2 for five at 6x (used while drawing).

import { LOOKS, groundPatch } from './styles';
import type { Look } from './styles';
import type { Px } from '../engine/px';
import { MAGE_OPTIONS, OPTION_LIGHTS, OAX, OAY, OH, OW } from './options_mage';
import type { MageOption } from './options_mage';

/** The chosen style: the last look. */
const L = LOOKS[LOOKS.length - 1] as Look;

/** Art pixels each design gets across, a strip's height, and where the floor line is in it. */
const COL = 72;
const ROW_H = 112;
const FLOOR = 92;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  return [cv, g];
}

/** rgba() from '#rrggbb' and an alpha. */
function tint(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** The leftmost and rightmost painted columns of a figure. */
function span(p: Px): [number, number] {
  let lo = p.w;
  let hi = 0;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (!p.has(x, y)) continue;
      if (x < lo) lo = x;
      if (x > hi) hi = x;
    }
  }
  return [lo, hi];
}

/** Several designs side by side on one strip of the style's floor. `s` = screen pixels per art pixel. */
function strip(opts: ReadonlyArray<MageOption>, s: number, hArt: number = ROW_H, floorArt: number = FLOOR, col: number = COL): HTMLCanvasElement {
  const wArt = col * opts.length;
  const w = wArt * s;
  const h = hArt * s;
  const [cv, g] = canvas(w, h);
  g.fillStyle = L.backdrop;
  g.fillRect(0, 0, w, h);
  const cx = Math.round(w / 2);
  const floorY = floorArt * s;
  const patch = groundPatch(L, Math.max(26, wArt / 2 - 12), 15).toCanvas();
  g.drawImage(patch, cx - (patch.width * s) / 2, floorY - (patch.height * s) / 2 - 2 * s, patch.width * s, patch.height * s);
  if (L.dark > 0) {
    // darkness above and to the sides; the floor in the middle keeps its light
    const k = Math.max(1, wArt / 216);
    g.save();
    g.translate(cx, floorY - 26 * s);
    g.scale(k, 1);
    const grad = g.createRadialGradient(0, 0, 30 * s, 0, 0, 216 * s * 0.62);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${L.dark * 0.85})`);
    g.fillStyle = grad;
    g.fillRect(-w, -h * 2, w * 2, h * 4);
    g.restore();
  }
  const figs = opts.map((o, i) => {
    const px = o.paint();
    const [lo, hi] = span(px);
    // centre what is painted in its column
    const x = Math.round((i + 0.5) * col - ((lo + hi + 1) / 2 - OAX)) * s;
    if (hi - lo + 1 > col - 2) console.log(`design ${o.n} is ${hi - lo + 1} wide: more than a column`);
    return { px, x };
  });
  // light: a pool round each figure
  g.globalCompositeOperation = 'lighter';
  for (const f of figs) {
    const pool = g.createRadialGradient(f.x, floorY - 28 * s, 0, f.x, floorY - 28 * s, 40 * s);
    pool.addColorStop(0, L.glow);
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = pool;
    g.fillRect(0, 0, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(0,0,0,0.4)';
  for (const f of figs) {
    g.beginPath();
    g.ellipse(f.x, floorY, 12 * s, 4.6 * s, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (const f of figs) g.drawImage(f.px.toCanvas(), f.x - OAX * s, floorY - OAY * s, OW * s, OH * s);
  // the glow of anything that shines
  g.globalCompositeOperation = 'lighter';
  for (const f of figs) {
    for (const li of OPTION_LIGHTS.get(f.px) ?? []) {
      const lx = f.x + (li.x - OAX) * s;
      const ly = floorY + (li.y - OAY) * s;
      const glow = g.createRadialGradient(lx, ly, 0, lx, ly, li.r * s);
      glow.addColorStop(0, tint(li.color, 0.5));
      glow.addColorStop(0.35, tint(li.color, 0.16));
      glow.addColorStop(1, tint(li.color, 0));
      g.fillStyle = glow;
      g.fillRect(0, 0, w, h);
    }
  }
  g.globalCompositeOperation = 'source-over';
  return cv;
}

const BG = '#17131c';
const GOLD = '#ffe070';
const TEXT = '#f0e8f0';
const DIM = '#a89cab';
const FONT = 'Inter, "DejaVu Sans", sans-serif';

/** A numbered badge. */
function badge(g: CanvasRenderingContext2D, x: number, y: number, r: number, n: number): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = BG;
  g.fill();
  g.lineWidth = Math.max(2, r * 0.14);
  g.strokeStyle = GOLD;
  g.stroke();
  g.fillStyle = GOLD;
  g.font = `800 ${Math.round(r * (n > 9 ? 1.02 : 1.2))}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(String(n), x, y + r * 0.06);
  g.textAlign = 'left';
  g.textBaseline = 'top';
}

/** Break a sentence into lines no wider than maxW (with the font already set). */
function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && g.measureText(next).width > maxW) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

function frame(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  g.strokeStyle = '#3a3242';
  g.lineWidth = 2;
  g.strokeRect(x - 1, y - 1, w + 2, h + 2);
}

/** The sheet: ten numbered designs in two rows, then all ten at the size they have on a phone. */
function sheet(): HTMLCanvasElement {
  const S = 4;
  const M = 2;
  const pad = 30;
  const per = 5;
  const colW = COL * S;
  const rowW = colW * per;
  const rowH = ROW_H * S;
  const W = rowW + pad * 2;
  const headH = 142;
  const capH = 122;
  const rows = Math.ceil(MAGE_OPTIONS.length / per);
  const phoneTop = headH + rows * (rowH + capH) + 4;
  const PH = 110;
  const PF = 92;
  const pcol = Math.floor(rowW / (MAGE_OPTIONS.length * M));
  const H = phoneTop + 56 + PH * M + 34;
  const [cv, g] = canvas(W, H);
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'top';

  g.fillStyle = GOLD;
  g.font = `800 46px ${FONT}`;
  g.fillText('Ten mages', pad, 26);
  g.fillStyle = TEXT;
  g.font = `500 23px ${FONT}`;
  g.fillText("Same colours as the style you chose. Pick one, or mix: 'the hat of 3 with the robe of 7'.", pad, 88);

  for (let r = 0; r < rows; r++) {
    const opts = MAGE_OPTIONS.slice(r * per, r * per + per);
    const y = headH + r * (rowH + capH);
    g.drawImage(strip(opts, S), pad, y);
    frame(g, pad, y, rowW, rowH);
    opts.forEach((o, i) => {
      const x = pad + i * colW;
      badge(g, x + 38, y + 38, 28, o.n);
      g.fillStyle = TEXT;
      g.font = `700 22px ${FONT}`;
      g.fillText(o.name, x + 8, y + rowH + 14);
      g.fillStyle = DIM;
      g.font = `400 16px ${FONT}`;
      wrap(g, o.note, colW - 22).forEach((line, k) => g.fillText(line, x + 8, y + rowH + 46 + k * 21));
    });
  }

  g.fillStyle = TEXT;
  g.font = `700 26px ${FONT}`;
  g.fillText('About the size you would see on a phone', pad, phoneTop + 8);
  const py = phoneTop + 56;
  const pw = pcol * MAGE_OPTIONS.length * M;
  g.drawImage(strip(MAGE_OPTIONS, M, PH, PF, pcol), pad, py);
  frame(g, pad, py, pw, PH * M);
  MAGE_OPTIONS.forEach((o, i) => badge(g, pad + i * pcol * M + 21, py + 21, 15, o.n));
  return cv;
}

function main(): void {
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.style.background = BG;
  document.body.style.margin = '0';
  const hash = location.hash;
  let cv: HTMLCanvasElement;
  const only = /only=(\d+)/.exec(hash);
  const half = /half=(\d+)/.exec(hash);
  if (only) {
    cv = strip(MAGE_OPTIONS.filter((o) => o.n === Number(only[1])), 8, ROW_H, FLOOR, 84);
  } else if (half) {
    const k = Number(half[1]) - 1;
    cv = strip(MAGE_OPTIONS.slice(k * 5, k * 5 + 5), 6);
  } else {
    cv = sheet();
  }
  cv.style.position = 'static';
  cv.style.display = 'block';
  document.body.appendChild(cv);
  console.log(`sheet ${cv.width}x${cv.height}`);
}

// Text is drawn with a font the page has to load first.
void document.fonts.load('800 46px Inter').then(() => {
  main();
  (window as unknown as { __ready: boolean }).__ready = true;
});
