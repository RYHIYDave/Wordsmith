// Dev preview: ten designs for the druid, in the colours of the chosen art style.
//   node tools/preview.mjs src/dev/preview_options_druid.ts previews/options_druid.png 1512 1496
// Add #only=3 for one design alone at 8x, #four=5 for designs 5 to 8 side by side at 7x, or #grid for
// all ten large with no text (used while drawing). The tool takes the view as a fifth argument:
//   node tools/preview.mjs src/dev/preview_options_druid.ts shots/druid_3.png 640 784 only=3

import { FAX, FAY, FH, FW, LOOKS, groundPatch } from './styles';
import { DRUIDS, GLOWS } from './options_druid';
import type { Option } from './options_druid';
import type { Look } from './styles';

const L: Look = LOOKS[LOOKS.length - 1];

/** A cell's size in art pixels. */
const CW = 70;
const CH = 98;
/** The floor point, from the cell's top. */
const FLOOR = CH - 19;

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

/** One design on the style's floor: backdrop, flagstones, darkness, a pool of light, shadow, figure, glow. */
function cell(o: Option, s: number, cw = CW, ch = CH): HTMLCanvasElement {
  const w = cw * s;
  const h = ch * s;
  const [cv, g] = canvas(w, h);
  g.fillStyle = L.backdrop;
  g.fillRect(0, 0, w, h);
  const cx = Math.round(w / 2);
  const floorY = (ch - (CH - FLOOR)) * s;
  const patch = groundPatch(L, 44, 15).toCanvas();
  g.drawImage(patch, cx - (patch.width * s) / 2, floorY - (patch.height * s) / 2 - 2 * s, patch.width * s, patch.height * s);
  // darkness closing in from the edges
  const grad = g.createRadialGradient(cx - 4 * s, floorY - 22 * s, 14 * s, cx, floorY - 22 * s, w * 0.92);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${L.dark + 0.25})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // a pool of light around the figure
  const pool = g.createRadialGradient(cx - 5 * s, floorY - 28 * s, 0, cx - 5 * s, floorY - 28 * s, 44 * s);
  pool.addColorStop(0, L.glow);
  pool.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = pool;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(0,0,0,0.4)';
  g.beginPath();
  g.ellipse(cx, floorY, 12 * s, 4.6 * s, 0, 0, Math.PI * 2);
  g.fill();
  const px = o.paint();
  g.drawImage(px.toCanvas(), cx - FAX * s, floorY - FAY * s, FW * s, FH * s);
  g.globalCompositeOperation = 'lighter';
  for (const li of GLOWS.get(px) ?? []) {
    const lx = cx + (li.x - FAX) * s;
    const ly = floorY + (li.y - FAY) * s;
    const glow = g.createRadialGradient(lx, ly, 0, lx, ly, li.r * s);
    glow.addColorStop(0, tint(li.color, 0.45));
    glow.addColorStop(0.35, tint(li.color, 0.14));
    glow.addColorStop(1, tint(li.color, 0));
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
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
  g.font = `800 ${Math.round(r * (n >= 10 ? 1.02 : 1.2))}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(String(n), x, y + r * 0.06);
  g.textAlign = 'left';
  g.textBaseline = 'top';
}

/** Break a sentence into lines no wider than `max`. */
function wrap(g: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? cur + ' ' + word : word;
    if (cur && g.measureText(next).width > max) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function frame(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  g.strokeStyle = '#3a3242';
  g.lineWidth = 2;
  g.strokeRect(x - 1, y - 1, w + 2, h + 2);
}

function sheet(): HTMLCanvasElement {
  const S = 4;
  const pad = 28;
  const gap = 14;
  const cw = CW * S;
  const ch = CH * S;
  const W = pad * 2 + cw * 5 + gap * 4;
  const headH = 136;
  const capH = 124;
  const M = 2;
  const mw = Math.floor((W - pad * 2 - 9 * 6) / 10);
  const mcw = Math.floor(mw / M);
  const mh = CH * M;
  const smallTop = headH + 2 * (ch + capH) + 6;
  const H = smallTop + 62 + mh + 64;
  const [cv, g] = canvas(W, H);
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'top';
  g.fillStyle = GOLD;
  g.font = `800 46px ${FONT}`;
  g.fillText('Ten druids', pad, 26);
  g.fillStyle = TEXT;
  g.font = `500 23px ${FONT}`;
  g.fillText("Same style as your three heroes, with a colour of its own: amber. Pick one, or mix: 'the mask of 3 with the cloak of 4'.", pad, 88);

  DRUIDS.forEach((o, i) => {
    const x = pad + (i % 5) * (cw + gap);
    const y = headH + Math.floor(i / 5) * (ch + capH);
    g.drawImage(cell(o, S), x, y);
    frame(g, x, y, cw, ch);
    badge(g, x + 34, y + 34, 24, o.n);
    g.fillStyle = TEXT;
    g.font = `700 23px ${FONT}`;
    if (g.measureText(o.name).width > cw) console.warn(`name of ${o.n} is wider than its cell: ${o.name}`);
    g.fillText(o.name, x, y + ch + 12);
    g.fillStyle = DIM;
    g.font = `400 16px ${FONT}`;
    const lines = wrap(g, o.note, cw - 4);
    if (lines.length > 3) console.warn(`note of ${o.n} runs to ${lines.length} lines`);
    lines.forEach((line, k) => g.fillText(line, x, y + ch + 46 + k * 21));
  });

  g.fillStyle = TEXT;
  g.font = `700 26px ${FONT}`;
  g.fillText('About the size you would see on a phone', pad, smallTop + 10);
  DRUIDS.forEach((o, i) => {
    const x = pad + i * (mcw * M + 6) + Math.floor((W - pad * 2 - 10 * mcw * M - 9 * 6) / 2);
    const y = smallTop + 58;
    g.drawImage(cell(o, M, mcw, CH), x, y);
    frame(g, x, y, mcw * M, mh);
    badge(g, x + 17, y + 17, 13, o.n);
  });
  return cv;
}

function main(): void {
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.style.background = BG;
  document.body.style.margin = '0';
  const only = /only=(\d+)/.exec(location.hash);
  let cv: HTMLCanvasElement;
  if (only) {
    const o = DRUIDS[Math.max(1, Math.min(DRUIDS.length, +only[1])) - 1];
    cv = cell(o, 8, FW + 4, CH);
  } else if (/four=(\d+)/.test(location.hash)) {
    const from = +(/four=(\d+)/.exec(location.hash) as RegExpExecArray)[1];
    const S = 7;
    const some = DRUIDS.slice(from - 1, from + 3);
    const [c2, g] = canvas(some.length * (FW + 2) * S, 96 * S);
    some.forEach((o, k) => g.drawImage(cell(o, S, FW + 2, 96), k * (FW + 2) * S, 0));
    cv = c2;
  } else if (location.hash.includes('grid')) {
    const S = 5;
    const [c2, g] = canvas(5 * CW * S, 2 * CH * S);
    DRUIDS.forEach((o, i) => g.drawImage(cell(o, S), (i % 5) * CW * S, Math.floor(i / 5) * CH * S));
    cv = c2;
  } else cv = sheet();
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
