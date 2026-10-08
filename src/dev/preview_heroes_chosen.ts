// Dev preview: the three hero designs the owner picked on 4 Oct 2026, side by side on one floor,
// with the walking bush he wants as the ranger's HIDE disguise.
//   node tools/preview.mjs src/dev/preview_heroes_chosen.ts previews/heroes_chosen.png 1500 940
// Concept art, not part of the game: the figures are the ones on the option sheets.

import type { Px } from '../engine/px';
import { MAGE_OPTIONS, OAX, OAY, OPTION_LIGHTS } from './options_mage';
import { ANCHOR, GLOWS, RANGERS } from './options_ranger';
import { OPTIONS, SHINE } from './options_warrior';
import { FAX, FAY, LOOKS, groundPatch } from './styles';
import type { Look } from './styles';

const L: Look = LOOKS[LOOKS.length - 1];
/** Screen pixels for each art pixel. */
const S = 5;
const W = 1500;

interface Figure {
  px: Px;
  ax: number;
  ay: number;
  /** Where on the strip the figure stands, in art pixels from its left. */
  at: number;
  title: string;
  name: string;
  note: string;
  /** Lights the figure gives off, in its own canvas. */
  lights: { x: number; y: number; r: number; color: string }[];
  /** Colours of the figure that glow (a lit blade). */
  shine: ReadonlyArray<string>;
}

function pick<T extends { n: number }>(list: ReadonlyArray<T>, n: number): T {
  const o = list.find((x) => x.n === n);
  if (!o) throw new Error(`no design ${n}`);
  return o;
}

const warrior = pick(OPTIONS, 10);
const ranger = pick(RANGERS, 1);
const mage = pick(MAGE_OPTIONS, 2);
const bush = pick(RANGERS, 6);

const wp = warrior.paint();
const rp = ranger.paint();
const mp = mage.paint();
const bp = bush.paint();

const figures: Figure[] = [
  { px: wp, ax: FAX, ay: FAY, at: 40, title: 'WARRIOR', name: `#10  ${warrior.name}`, note: 'He starts with a two-handed sword, so he gets drawn with that too.', lights: [], shine: SHINE },
  { px: rp, ax: ANCHOR.x, ay: ANCHOR.y, at: 112, title: 'RANGER', name: `#1  ${ranger.name}`, note: 'A feather in the cap, a cloak and a short bow.', lights: GLOWS.get(rp) ?? [], shine: [] },
  { px: mp, ax: OAX, ay: OAY, at: 184, title: 'MAGE', name: `#2  ${mage.name}`, note: 'A scarf up to the eyes and a crystal on the staff.', lights: OPTION_LIGHTS.get(mp) ?? [], shine: [] },
  { px: bp, ax: ANCHOR.x, ay: ANCHOR.y, at: 256, title: 'HIDE', name: 'The walking bush', note: "The ranger's new swipe move: a disguise, and monsters lose track of you.", lights: GLOWS.get(bp) ?? [], shine: [] },
];

/** The strip's size in art pixels. */
const SW = Math.floor(W / S) - 8;
const SH = 124;
const FLOOR = SH - 22;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  return [cv, g];
}

function tint(hex: string, a: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function strip(): HTMLCanvasElement {
  const w = SW * S;
  const h = SH * S;
  const [cv, g] = canvas(w, h);
  g.fillStyle = L.backdrop;
  g.fillRect(0, 0, w, h);
  const floorY = FLOOR * S;
  // one long floor: patches laid side by side
  const patch = groundPatch(L, 56, 17).toCanvas();
  for (let x = -20; x < SW; x += 84) g.drawImage(patch, x * S, floorY - (patch.height * S) / 2 - 3 * S, patch.width * S, patch.height * S);
  // darkness from the edges
  const grad = g.createRadialGradient(w / 2, floorY - 30 * S, 60 * S, w / 2, floorY - 30 * S, w * 0.62);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${L.dark + 0.2})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  for (const f of figures) {
    const cx = f.at * S;
    // a pool of light, and the shadow under the feet
    const pool = g.createRadialGradient(cx - 5 * S, floorY - 28 * S, 0, cx - 5 * S, floorY - 28 * S, 46 * S);
    pool.addColorStop(0, L.glow);
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = pool;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.beginPath();
    g.ellipse(cx, floorY, 13 * S, 5 * S, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (const f of figures) {
    const x0 = (f.at - f.ax) * S;
    const y0 = (FLOOR - f.ay) * S;
    const img = f.px.toCanvas();
    g.drawImage(img, x0, y0, f.px.w * S, f.px.h * S);
    // what glows, glows: lights the design names, and its bright blade
    g.globalCompositeOperation = 'lighter';
    for (const l of f.lights) {
      const gx = x0 + l.x * S;
      const gy = y0 + l.y * S;
      const r = l.r * S;
      const glow = g.createRadialGradient(gx, gy, 0, gx, gy, r);
      glow.addColorStop(0, tint(l.color, 0.5));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glow;
      g.fillRect(gx - r, gy - r, r * 2, r * 2);
    }
    if (f.shine.length) {
      const [mask, mg] = canvas(f.px.w, f.px.h);
      mg.fillStyle = '#3ce6f0';
      for (let y = 0; y < f.px.h; y++) for (let x = 0; x < f.px.w; x++) if (f.shine.includes(f.px.get(x, y) ?? '')) mg.fillRect(x, y, 1, 1);
      for (const [blur, alpha] of [[7, 0.5], [2.5, 0.35]] as const) {
        g.filter = `blur(${blur * S}px)`;
        g.globalAlpha = alpha;
        g.drawImage(mask, x0, y0, f.px.w * S, f.px.h * S);
      }
      g.filter = 'none';
      g.globalAlpha = 1;
    }
    g.globalCompositeOperation = 'source-over';
  }
  return cv;
}

function wrap(g: CanvasRenderingContext2D, text: string, width: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > width && line) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

const st = strip();
const H = 150 + st.height + 170;
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#16131c';
g.fillRect(0, 0, W, H);
g.textBaseline = 'top';
g.fillStyle = '#ffd866';
g.font = 'bold 50px system-ui, -apple-system, Segoe UI, sans-serif';
g.fillText('Your three heroes', 24, 22);
g.fillStyle = '#e8e4f0';
g.font = '25px system-ui, -apple-system, Segoe UI, sans-serif';
g.fillText('Warrior 10, ranger 1 and mage 2, as you picked them, and the bush for HIDE.', 24, 88);
const sx = Math.floor((W - st.width) / 2);
const sy = 140;
g.drawImage(st, sx, sy);
g.strokeStyle = '#3a3448';
g.lineWidth = 2;
g.strokeRect(sx - 1, sy - 1, st.width + 2, st.height + 2);
for (const f of figures) {
  const cx = sx + f.at * S;
  const colW = 340;
  let y = sy + st.height + 16;
  g.textAlign = 'center';
  g.fillStyle = '#ffd866';
  g.font = 'bold 22px system-ui, -apple-system, Segoe UI, sans-serif';
  g.fillText(f.title, cx, y);
  y += 30;
  g.fillStyle = '#ffffff';
  g.font = 'bold 26px system-ui, -apple-system, Segoe UI, sans-serif';
  g.fillText(f.name, cx, y);
  y += 36;
  g.fillStyle = '#a8a2b8';
  g.font = '20px system-ui, -apple-system, Segoe UI, sans-serif';
  for (const row of wrap(g, f.note, colW)) {
    g.fillText(row, cx, y);
    y += 26;
  }
  g.textAlign = 'left';
}

(window as unknown as { __ready: boolean }).__ready = true;
