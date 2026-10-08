// Dev preview: designs for the wordsmith, on the dungeon's own floor, for the owner to pick from.
//   node tools/preview.mjs src/dev/preview_options_wordsmith.ts previews/options_wordsmith.png 1552 1468
// Add a view as a fifth argument: only=3 for one design alone, large; four=5 for designs 5 to 8
// side by side, large; grid for all ten large with no text (used while drawing).
//   node tools/preview.mjs src/dev/preview_options_wordsmith.ts shots/ws_3.png 672 896 only=3
// The SECOND sheet (designs 11 to 20: the three he liked, changed and mixed) is the same page with
// "two" in the view: "two" for the sheet, "two,grid", "two,only=14", "two,four=11".
//   node tools/preview.mjs src/dev/preview_options_wordsmith.ts previews/options_wordsmith_2.png 1552 1468 two

import { makeGroundArt } from '../art/ground';
import { GRAIN, KAX, KAY, KH, KW } from '../art/kit';
import { WORDSMITHS as FIRST } from './options_wordsmith';
import type { Option } from './options_wordsmith';
import { WORDSMITHS2 } from './options_wordsmith2';

/** Which sheet: the first ten, or the second. */
const TWO = location.hash.includes('two');
const WORDSMITHS: Option[] = TWO ? WORDSMITHS2 : FIRST;
/** On the second sheet: the three of the first that it is made from, shown small beside the title. */
const LIKED: Option[] = TWO ? [5, 2, 7].map((n) => FIRST[n - 1]) : [];

const ground = makeGroundArt();

/** A cell's size in picture pixels (two to a game pixel). */
const CW = 72;
const CH = 100;
/** The floor point, from the cell's top. */
const FLOOR = CH - 14;

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

/** One design: the floor, the dark, a pool of light, a shadow, the figure, and what it gives off. `s`: screen pixels to a picture pixel. */
function cell(o: Option, s: number, cw = CW, ch = CH): HTMLCanvasElement {
  const w = cw * s;
  const h = ch * s;
  const [cv, g] = canvas(w, h);
  g.fillStyle = '#05040c';
  g.fillRect(0, 0, w, h);
  const cx = Math.round(w / 2);
  const floorY = (ch - (CH - FLOOR)) * s;
  // the floor: the game's own flagstones, the figure standing in the middle of one
  const k = GRAIN * s;
  for (let sum = -8; sum <= 8; sum++) {
    for (let tx = -5; tx <= 5; tx++) {
      const ty = sum - tx;
      if (ty < -5 || ty > 5) continue;
      const f = ground.floor(tx + 40, ty + 40);
      const x = cx + ((tx - ty) * 16 - f.ax) * k;
      const y = floorY + ((tx + ty) * 8 - 8 - f.ay) * k;
      if (x > w || y > h || x + f.w * k < 0 || y + f.h * k < 0) continue;
      g.drawImage(f.img, x, y, f.w * k, f.h * k);
    }
  }
  // the dark closing in from the edges
  g.fillStyle = 'rgba(3,2,10,0.3)';
  g.fillRect(0, 0, w, h);
  const grad = g.createRadialGradient(cx - 4 * s, floorY - 26 * s, 16 * s, cx, floorY - 26 * s, w * 0.72);
  grad.addColorStop(0, 'rgba(3,2,10,0)');
  grad.addColorStop(1, 'rgba(3,2,10,0.94)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // the pool of light the game puts behind a friend
  g.globalCompositeOperation = 'lighter';
  const pool = g.createRadialGradient(cx - 4 * s, floorY - 30 * s, 0, cx - 4 * s, floorY - 30 * s, 50 * s);
  pool.addColorStop(0, tint('#28dcf0', 0.2));
  pool.addColorStop(1, tint('#28dcf0', 0));
  g.fillStyle = pool;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.beginPath();
  g.ellipse(cx, floorY, 15 * s, 5.5 * s, 0, 0, Math.PI * 2);
  g.fill();
  const f = o.paint();
  g.drawImage(f.px.toCanvas(), cx - KAX * s, floorY - KAY * s, KW * s, KH * s);
  g.globalCompositeOperation = 'lighter';
  for (const li of f.lights) {
    const lx = cx + (li.x - KAX) * s;
    const ly = floorY + (li.y - KAY) * s;
    const a = li.a ?? 0.5;
    const glow = g.createRadialGradient(lx, ly, 0, lx, ly, li.r * s);
    glow.addColorStop(0, tint(li.color, a));
    glow.addColorStop(0.35, tint(li.color, a * 0.32));
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
  const headH = TWO ? 244 : 136;
  const capH = 150;
  const mw = Math.floor((W - pad * 2 - 9 * 6) / 10);
  const smallTop = headH + 2 * (ch + capH) + 6;
  const H = smallTop + 62 + CH + 64;
  const [cv, g] = canvas(W, H);
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'top';
  g.fillStyle = GOLD;
  g.font = `800 46px ${FONT}`;
  g.fillText(TWO ? 'Ten more wordsmiths' : 'Ten wordsmiths', pad, 26);
  g.fillStyle = TEXT;
  g.font = `500 23px ${FONT}`;
  if (TWO) {
    g.fillText('5, 2 and 7, changed a little and mixed together.', pad, 88);
    g.fillText("Pick one, or keep mixing: 'the beard of 12 on 18'.", pad, 122);
    // the three they are made from, beside the title
    const rs = 2;
    const rw = CW * rs;
    const rh = CH * rs;
    const rx = W - pad - LIKED.length * rw - (LIKED.length - 1) * gap;
    g.fillStyle = DIM;
    g.font = `500 19px ${FONT}`;
    g.textAlign = 'right';
    g.fillText('The three you liked,', rx - 18, 96);
    g.fillText('from the first sheet', rx - 18, 122);
    g.textAlign = 'left';
    LIKED.forEach((o, i) => {
      const x = rx + i * (rw + gap);
      g.drawImage(cell(o, rs), x, 20);
      frame(g, x, 20, rw, rh);
      badge(g, x + 22, 42, 16, o.n);
    });
  } else g.fillText("Drawn the new way, seen from a corner. Pick one, or mix: 'the beard of 2 on 5'.", pad, 88);

  WORDSMITHS.forEach((o, i) => {
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
    if (lines.length > 4) console.warn(`note of ${o.n} runs to ${lines.length} lines`);
    lines.forEach((line, k) => g.fillText(line, x, y + ch + 46 + k * 21));
  });

  g.fillStyle = TEXT;
  g.font = `700 26px ${FONT}`;
  g.fillText('About the size they are in the game', pad, smallTop + 10);
  WORDSMITHS.forEach((o, i) => {
    const x = pad + i * (mw + 6);
    const y = smallTop + 58;
    g.drawImage(cell(o, 1, mw, CH), x, y);
    frame(g, x, y, mw, CH);
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
  /** Where a design is in the list, by its number. */
  const at = (n: number): number => Math.max(0, Math.min(WORDSMITHS.length - 1, n - WORDSMITHS[0].n));
  if (only) {
    const o = WORDSMITHS[at(+only[1])];
    cv = cell(o, 8);
  } else if (/four=(\d+)/.test(location.hash)) {
    const from = +(/four=(\d+)/.exec(location.hash) as RegExpExecArray)[1];
    const S = 6;
    const some = WORDSMITHS.slice(at(from), at(from) + 4);
    const [c2, g] = canvas(some.length * CW * S, CH * S);
    some.forEach((o, k) => g.drawImage(cell(o, S), k * CW * S, 0));
    cv = c2;
  } else if (location.hash.includes('grid')) {
    const S = 5;
    const [c2, g] = canvas(5 * CW * S, 2 * CH * S);
    WORDSMITHS.forEach((o, i) => g.drawImage(cell(o, S), (i % 5) * CW * S, Math.floor(i / 5) * CH * S));
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
