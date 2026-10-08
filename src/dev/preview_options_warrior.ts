// Dev preview: ten designs for the warrior, in the colours of the chosen art style.
//   node tools/preview.mjs src/dev/preview_options_warrior.ts previews/options_warrior.png 1500 900
// Add #only=3 for one design alone, large (used while drawing); #all for the ten in a row, large.

import { FAX, FAY, FH, FW, LOOKS, groundPatch } from './styles';
import { OPTIONS, SHINE } from './options_warrior';
import type { WarriorOption } from './options_warrior';
import type { Px } from '../engine/px';

const L = LOOKS[LOOKS.length - 1];

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  return [cv, g];
}

/** Only the pixels of a figure that give off light, as one flat colour. */
function shine(px: Px): HTMLCanvasElement {
  const [cv, g] = canvas(px.w, px.h);
  g.fillStyle = 'rgb(60,230,240)';
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (SHINE.includes(px.get(x, y) ?? '')) g.fillRect(x, y, 1, 1);
  return cv;
}

/** Figures side by side on one strip of floor. `s` = screen pixels per art pixel, `step` = art pixels between them. */
function row(opts: ReadonlyArray<WarriorOption>, s: number, step: number, RH: number): HTMLCanvasElement {
  const RW = opts.length * step + 8;
  const w = RW * s;
  const h = RH * s;
  const [cv, g] = canvas(w, h);
  g.fillStyle = L.backdrop;
  g.fillRect(0, 0, w, h);
  const cx = Math.round(w / 2);
  const floorY = (RH - 22) * s;
  const patch = groundPatch(L, Math.round(RW / 2) - 6, 15).toCanvas();
  g.drawImage(patch, cx - (patch.width * s) / 2, floorY - (patch.height * s) / 2 - 2 * s, patch.width * s, patch.height * s);
  // darkness above and below; the floor under the figures keeps its light
  const dark = g.createLinearGradient(0, 0, 0, h);
  dark.addColorStop(0, `rgba(0,0,0,${L.dark * 0.8})`);
  dark.addColorStop(0.5, `rgba(0,0,0,${L.dark * 0.3})`);
  dark.addColorStop((RH - 26) / RH, 'rgba(0,0,0,0)');
  dark.addColorStop(1, `rgba(0,0,0,${L.dark * 0.9})`);
  g.fillStyle = dark;
  g.fillRect(0, 0, w, h);
  for (const [x0, x1] of [[0, 26 * s], [w, w - 26 * s]] as const) {
    const side = g.createLinearGradient(x0, 0, x1, 0);
    side.addColorStop(0, `rgba(0,0,0,${L.dark})`);
    side.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = side;
    g.fillRect(0, 0, w, h);
  }
  const figs = opts.map((o, i) => ({ px: o.paint(), x: (4 + step / 2 + i * step) * s }));
  // a pool of light round each figure
  g.globalCompositeOperation = 'lighter';
  for (const f of figs) {
    const pool = g.createRadialGradient(f.x, floorY - 28 * s, 0, f.x, floorY - 28 * s, 40 * s);
    pool.addColorStop(0, L.glow);
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = pool;
    g.fillRect(f.x - 40 * s, 0, 80 * s, h);
  }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(0,0,0,0.4)';
  for (const f of figs) {
    g.beginPath();
    g.ellipse(f.x, floorY, 13 * s, 4.8 * s, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (const f of figs) g.drawImage(f.px.toCanvas(), f.x - FAX * s, floorY - FAY * s, FW * s, FH * s);
  // whatever glows gives off light
  g.globalCompositeOperation = 'lighter';
  for (const f of figs) {
    const sh = shine(f.px);
    for (const [blur, alpha] of [[7, 0.5], [2.5, 0.35]] as const) {
      g.filter = `blur(${blur * s}px)`;
      g.globalAlpha = alpha;
      g.drawImage(sh, f.x - FAX * s, floorY - FAY * s, FW * s, FH * s);
    }
  }
  g.filter = 'none';
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  return cv;
}

const BG = '#17131c';
const GOLD = '#ffe070';
const TEXT = '#f0e8f0';
const DIM = '#a89cab';
const FONT = 'Inter, "DejaVu Sans", sans-serif';

function badge(g: CanvasRenderingContext2D, x: number, y: number, r: number, n: number): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = BG;
  g.fill();
  g.lineWidth = Math.max(2, r * 0.14);
  g.strokeStyle = GOLD;
  g.stroke();
  g.fillStyle = GOLD;
  g.font = `800 ${Math.round(r * (n >= 10 ? 1.05 : 1.2))}px ${FONT}`;
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

function sheet(): HTMLCanvasElement {
  const S = 4;
  const STEP = 72;
  const RH = 110;
  const pad = 14;
  const per = 5;
  const rw = (per * STEP + 8) * S;
  const W = pad * 2 + rw;
  const headH = 142;
  const capH = 150;
  const rowH = RH * S + capH;
  const rows = Math.ceil(OPTIONS.length / per);
  const M = 2;
  const MSTEP = 72;
  const MH = 110;
  const smallTop = headH + rows * rowH + 6;
  const H = smallTop + 60 + MH * M + 64;
  const [cv, g] = canvas(W, H);
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'top';
  const tx = pad + 10;

  g.fillStyle = GOLD;
  g.font = `800 46px ${FONT}`;
  g.fillText('Ten warriors', tx, 24);
  g.fillStyle = TEXT;
  g.font = `500 23px ${FONT}`;
  g.fillText("Same colours as the style you chose. Pick one, or mix: 'the helm of 3 with the cape of 7'.", tx, 88);

  const frame = (x: number, y: number, w: number, h: number): void => {
    g.strokeStyle = '#3a3242';
    g.lineWidth = 2;
    g.strokeRect(x - 1, y - 1, w + 2, h + 2);
  };
  for (let r = 0; r < rows; r++) {
    const group = OPTIONS.slice(r * per, r * per + per);
    const y = headH + r * rowH;
    g.drawImage(row(group, S, STEP, RH), pad, y);
    frame(pad, y, rw, RH * S);
    group.forEach((o, i) => {
      const colX = pad + (4 + i * STEP) * S;
      const colW = STEP * S;
      const ty = y + RH * S + 14;
      badge(g, colX + 34, ty + 22, 23, o.n);
      g.fillStyle = TEXT;
      g.font = `700 22px ${FONT}`;
      const nameLines = wrap(g, o.name, colW - 76);
      nameLines.forEach((line, k) => g.fillText(line, colX + 66, ty + (nameLines.length > 1 ? -2 : 10) + k * 25));
      g.fillStyle = DIM;
      g.font = `400 16.5px ${FONT}`;
      const noteLines = wrap(g, o.note, colW - 24);
      if (noteLines.length > 3) console.warn(`note ${o.n} runs to ${noteLines.length} lines`);
      noteLines.forEach((line, k) => g.fillText(line, colX + 10, ty + 56 + k * 21));
    });
  }

  g.fillStyle = TEXT;
  g.font = `700 26px ${FONT}`;
  g.fillText('About the size you would see on a phone', tx, smallTop + 10);
  const mw = (OPTIONS.length * MSTEP + 8) * M;
  const mx = Math.round((W - mw) / 2);
  const my = smallTop + 60;
  g.drawImage(row(OPTIONS, M, MSTEP, MH), mx, my);
  frame(mx, my, mw, MH * M);
  OPTIONS.forEach((o, i) => badge(g, mx + (4 + MSTEP / 2 + i * MSTEP) * M, my + MH * M + 28, 17, o.n));
  return cv;
}

function main(): void {
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.style.background = BG;
  const only = /only=(\d+)/.exec(location.hash);
  let cv: HTMLCanvasElement;
  if (only) {
    const o = OPTIONS.filter((x) => x.n === Number(only[1]));
    cv = row(o, 8, 80, 112);
  } else if (location.hash.includes('all')) {
    const S = 5;
    const [c2, g] = canvas((5 * 72 + 8) * S, 2 * 110 * S);
    g.drawImage(row(OPTIONS.slice(0, 5), S, 72, 110), 0, 0);
    g.drawImage(row(OPTIONS.slice(5), S, 72, 110), 0, 110 * S);
    cv = c2;
  } else cv = sheet();
  // how much room each design takes, to keep neighbours apart
  for (const o of OPTIONS) {
    const p = o.paint();
    let x0 = p.w;
    let x1 = 0;
    let y0 = p.h;
    p.each((x, y) => {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      return null;
    });
    console.log(`${o.n} ${o.name}: x ${x0 - FAX}..${x1 - FAX}, top ${y0}`);
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
