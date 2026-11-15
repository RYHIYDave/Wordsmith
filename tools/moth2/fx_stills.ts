// THE MOTH MADE GHOSTLY: STILLS OF HER NEW ATTACKS' EFFECTS (art/moth2_fx.ts), drawn on a plain grey floor without a browser, for
// looking at them while they are made (the game's own film is tools/scenarios/moth2_fight.mjs).
//   node node_modules/tsx/dist/cli.mjs tools/moth2/fx_stills.ts <out.png>
import fs from 'node:fs';
// @ts-ignore
import { encodePng } from '../png.mjs';
import { drawEclipse, drawGhostWing, drawHushGround, drawHushSnow, drawMoon, drawPagesLoosing, drawPhantoms, drawPhantomsGather, drawUnwritingGround, drawUnwritingPages, moonAt } from '../../src/art/moth2_fx';
import { ECLIPSE, PHANTOMS } from '../../src/art/moth2';

const W = 520;
const H = 300;
/** A canvas of game pixels that takes fillRect, with its alpha laid over what is there. */
function canvas(): { g: CanvasRenderingContext2D; px: Uint8ClampedArray } {
  const px = new Uint8ClampedArray(W * H * 4);
  // (a grey floor of flags)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const tile = ((Math.floor((x / 32 + y / 16) ) + Math.floor((y / 16 - x / 32 + 100))) & 1) === 0;
    const v = tile ? 92 : 86;
    px[i] = v; px[i + 1] = v; px[i + 2] = v + 6; px[i + 3] = 255;
  }
  const st = { fillStyle: '#000', globalAlpha: 1 };
  const g = {
    get fillStyle() { return st.fillStyle; },
    set fillStyle(v: string) { st.fillStyle = v; },
    get globalAlpha() { return st.globalAlpha; },
    set globalAlpha(v: number) { st.globalAlpha = v; },
    fillRect(x: number, y: number, w: number, h: number) {
      const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(st.fillStyle);
      if (!m) return;
      const r = parseInt(m[1], 16), gg = parseInt(m[2], 16), b = parseInt(m[3], 16);
      const a = Math.max(0, Math.min(1, st.globalAlpha));
      for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(H, Math.floor(y + h)); yy++) for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(W, Math.floor(x + w)); xx++) {
        const i = (yy * W + xx) * 4;
        px[i] = px[i] * (1 - a) + r * a; px[i + 1] = px[i + 1] * (1 - a) + gg * a; px[i + 2] = px[i + 2] * (1 - a) + b * a;
      }
    },
  } as unknown as CanvasRenderingContext2D;
  return { g, px };
}
const at = (x: number, y: number): readonly [number, number] => [W / 2 + (x - y) * 16, 60 + (x + y) * 8];
const shots: [string, (g: CanvasRenderingContext2D) => void][] = [
  ['ghost wing 0.2', (g) => drawGhostWing(g, at, 4, 4, Math.SQRT1_2, Math.SQRT1_2, 0.2)],
  ['ghost wing 0.5', (g) => drawGhostWing(g, at, 4, 4, Math.SQRT1_2, Math.SQRT1_2, 0.5)],
  ['moon', (g) => drawMoon(g, W / 2, 120, 1, 0.7)],
  ['eclipse 0.7', (g) => { const [sx, sy] = at(3, 3); drawMoon(g, sx, sy - 190, moonAt(0.7), 0.7); drawEclipse(g, at, 3, 3, Math.SQRT1_2, Math.SQRT1_2, 0.7, ...at(7, 7), 0.7); }],
  ['eclipse 1.1', (g) => { const [sx, sy] = at(3, 3); drawMoon(g, sx, sy - 190, moonAt(1.1), 1.1); drawEclipse(g, at, 3, 3, Math.SQRT1_2, Math.SQRT1_2, 1.1, ...at(7, 7), 1.1); }],
  ['eclipse strikes +0.15', (g) => { const t = ECLIPSE.hit + 0.15; const [sx, sy] = at(3, 3); drawMoon(g, sx, sy - 190, moonAt(t), t); drawEclipse(g, at, 3, 3, Math.SQRT1_2, Math.SQRT1_2, t, ...at(7, 7), t); }],
  ['eclipse +0.6', (g) => { const t = ECLIPSE.hit + 0.6; drawEclipse(g, at, 3, 3, Math.SQRT1_2, Math.SQRT1_2, t, ...at(7, 7), t); }],
  ['phantoms gather', (g) => drawPhantomsGather(g, at, 3, 3, Math.SQRT1_2, Math.SQRT1_2, 0.8, 90, 1.3)],
  ['phantoms 0.5', (g) => drawPhantoms(g, at, 2, 2, Math.SQRT1_2, Math.SQRT1_2, 0.5)],
  ['phantoms 0.9', (g) => drawPhantoms(g, at, 2, 2, Math.SQRT1_2, Math.SQRT1_2, 0.9)],
  ['hush 0.6', (g) => { drawHushGround(g, at, 7, 7, 3.5, 0.6, 0.6); drawHushSnow(g, at, 7, 7, 3.5, 0.6); }],
  ['hush 3.0', (g) => { drawHushGround(g, at, 7, 7, 3.5, 3.0, 3.0); drawHushSnow(g, at, 7, 7, 3.5, 3.0); }],
  ['pages loosing', (g) => drawPagesLoosing(g, at, 7, 7, 0.8, 0.9)],
  ['unwriting 0.25', (g) => { drawUnwritingGround(g, at, 7, 7, 6, 0.75, 1); drawUnwritingPages(g, at, 7, 7, 6, 0.25, 1); }],
  ['unwriting 0.6', (g) => { drawUnwritingGround(g, at, 7, 7, 10, 0.75, 1); drawUnwritingPages(g, at, 7, 7, 10, 0.6, 1); }],
];
void PHANTOMS;
const which = (process.env.ONLY || '').split(',').filter(Boolean);
const list = which.length ? shots.filter(([n]) => which.some((w) => n.startsWith(w))) : shots;
const cols = 2;
const rows = Math.ceil(list.length / cols);
const S = 2;
const out = new Uint8ClampedArray(W * S * cols * H * S * rows * 4);
const OW = W * S * cols;
list.forEach(([name, draw], k) => {
  const { g, px } = canvas();
  draw(g);
  const ox = (k % cols) * W * S;
  const oy = Math.floor(k / cols) * H * S;
  for (let y = 0; y < H * S; y++) for (let x = 0; x < W * S; x++) {
    const s = (Math.floor(y / S) * W + Math.floor(x / S)) * 4;
    const d = ((oy + y) * OW + ox + x) * 4;
    out[d] = px[s]; out[d + 1] = px[s + 1]; out[d + 2] = px[s + 2]; out[d + 3] = 255;
  }
  console.log(k, name);
});
fs.writeFileSync(process.argv[2] || '/tmp/moth2_fx.png', encodePng(OW, H * S * rows, out));
