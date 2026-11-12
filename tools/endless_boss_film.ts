// ENDLESS MODE'S FINAL BOSS: A MOVE AS A FILM (src/art/endless_boss.ts), painted as the game paints its monsters, no browser. The
// boss on a floor of dark flags, carried over it as the game carries him (a charge), the warning marked on the floor while he
// holds it (the rules are the main chat's: here only to show it), his strike smeared, his lights laid soft over the dark.
//   npx tsx tools/endless_boss_film.ts <out dir> <move> <front|rear> [w h]   writes <out dir>/f/000.png ... at one picture pixel a
//   game pixel (the film is made from them with ffmpeg)
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { CHARGE, CHARGE_SKID, CHARGE_STRIKE, WS_CANVAS, chargeCarry, chargeSmeared, wsMob } from '../src/art/endless_boss';
import { png } from './king_png';

const [out = '/tmp/wsfilm', move = 'charge', view0 = 'front', w0 = '420', h0 = '300'] = process.argv.slice(2);
const view = view0 as 'front' | 'rear';
const W = Number(w0);
const H = Number(h0);
const TILE = 32 / Math.sqrt(2 / 3);
mkdirSync(`${out}/f`, { recursive: true });
const mob = wsMob();
const st = stage(paintViewOf(mob, view), WS_CANVAS.ax, WS_CANVAS.ay, WS_CANVAS);
const at = (p: [number, number, number]): [number, number] => {
  const [x, y] = st.at(p);
  return [x - WS_CANVAS.ax, y - WS_CANVAS.ay];
};
const rgb = (c: string): number[] => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const hex = (r: number, g: number, b: number): string => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (s: Px, x: number, y: number, c: string, a: number): void => {
  if (x < 0 || y < 0 || x >= s.w || y >= s.h) return;
  const [r0, g0, b0] = rgb(s.get(x, y) ?? '#000000');
  const [r, g, b] = rgb(c);
  s.set(x, y, hex(r0 + (r - r0) * a, g0 + (g - g0) * a, b0 + (b - b0) * a));
};
const long = move === 'charge' ? CHARGE.long : 3;
const carry = (t: number): number => (move === 'charge' ? chargeCarry(t) : 0);
// (the camera follows him, a little behind: his floor point held near the picture's middle, the floor going by)
const sx = Math.round(W / 2);
const sy = Math.round(H / 2 + 50);
/** The floor: dark flags, their joints, lit a little toward the upper left (moved by the camera: `cx`, `cy`). */
function floor(cx: number, cy: number): Px {
  const s = new Px(W, H);
  for (let y0 = 0; y0 < H; y0++) {
    for (let x0 = 0; x0 < W; x0++) {
      const x = x0 + cx;
      const y = y0 + cy;
      // (flags laid on the floor's own lines, as the game's iso floor is)
      const u = (x / 2 + y) / 22;
      const v = (-x / 2 + y) / 22;
      const fu = u - Math.floor(u);
      const fv = v - Math.floor(v);
      const n = Math.sin(Math.floor(u) * 12.9898 + Math.floor(v) * 78.233) * 43758.5453;
      const k = n - Math.floor(n);
      const joint = fu < 0.05 || fv < 0.05;
      s.set(x0, y0, joint ? '#1c161c' : k < 0.33 ? '#2a2228' : k < 0.66 ? '#2e262c' : '#272026');
    }
  }
  return s;
}
/** The lane, marked while he winds up and holds: a band of the enemy's pink down the floor, chevrons running along it. */
function lane(s: Px, t: number, ox: number, oy: number): void {
  const [s0] = CHARGE_STRIKE;
  if (t < 0.15 || t > s0 + 0.05) return;
  const a = Math.min(1, (t - 0.15) / 0.2) * (t > s0 ? 0.5 : 1);
  const L = CHARGE.lane * TILE;
  const half = CHARGE.half * TILE;
  for (let i = 0; i <= 260; i++) {
    for (let j = -12; j <= 12; j++) {
      const f = i / 260;
      const side = j / 12;
      const [x, y] = at([f * L, side * half, 0]);
      const edge = Math.abs(side) > 0.86;
      // (chevrons running down it, toward where he will go)
      const ch = (f * 26 - t * 5 - Math.abs(side) * 1.2) % 1;
      const on = edge ? 0.55 : ch > 0 && ch < 0.22 ? 0.32 : 0.12;
      mix(s, Math.round(ox + x), Math.round(oy + y), '#ff4f8a', on * a * (1 - 0.3 * f));
    }
  }
}
/** His picture laid on the floor at (ox, oy): his painted pixels, then his lights soft over them. */
function lay(s: Px, t: number, ox: number, oy: number, ghost = 0): void {
  const { px, lights } = paintMob(mob, move, t, view);
  const x0 = Math.round(ox - WS_CANVAS.ax);
  const y0 = Math.round(oy - WS_CANVAS.ay);
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      const c = px.get(x, y);
      if (!c) continue;
      if (ghost) mix(s, x0 + x, y0 + y, c, ghost);
      else if (x0 + x >= 0 && y0 + y >= 0 && x0 + x < W && y0 + y < H) s.set(x0 + x, y0 + y, c);
    }
  }
  if (ghost) return;
  for (const l of lights) {
    const [r, g, b] = rgb(l.color);
    for (let y = Math.floor(l.y - l.r); y <= Math.ceil(l.y + l.r); y++) {
      for (let x = Math.floor(l.x - l.r); x <= Math.ceil(l.x + l.r); x++) {
        const q = Math.hypot(x - l.x, y - l.y) / l.r;
        if (q >= 1) continue;
        mix(s, x0 + x, y0 + y, hex(r, g, b), (l.a ?? 0.5) * (1 - q) * (1 - q));
      }
    }
  }
}
const N = Math.round(long * 30);
let camX = 0;
let camY = 0;
for (let i = 0; i <= N; i++) {
  const t = i / 30;
  // (the camera eases after him)
  const [tx, ty] = at([carry(t) * TILE, 0, 0]);
  camX += (tx - camX) * (i === 0 ? 1 : 0.32);
  camY += (ty - camY) * (i === 0 ? 1 : 0.32);
  // (the screen kicks as it bursts off and as it digs in to stop: his rulebook's Animations, “the screen kicks on big casts and hits”)
  const kick = move === 'charge' ? Math.max(0, 1 - Math.abs(t - CHARGE_STRIKE[1]) / 0.1) * 3 + Math.max(0, 1 - Math.abs(t - CHARGE_SKID[0] - 0.1) / 0.12) * 2 : 0;
  const ox = sx - Math.round(camX) + Math.round(kick * Math.sin(i * 2.7));
  const oy = sy - Math.round(camY) + Math.round(kick * Math.cos(i * 3.1));
  const s = floor(-ox, -oy);
  lane(s, t, ox, oy);
  const where = (tt: number): [number, number] => {
    const [x, y] = at([carry(tt) * TILE, 0, 0]);
    return [ox + x, oy + y];
  };
  // (his strike smeared: after-images of him along the way he came, fading)
  if (move === 'charge' && chargeSmeared(t)) {
    for (const [k, a] of [[3, 0.18], [2, 0.3], [1, 0.45]] as const) {
      const [x, y] = where(t - k * (1 / 90));
      lay(s, t, x, y, a);
    }
  }
  const [x, y] = where(t);
  lay(s, t, x, y);
  writeFileSync(`${out}/f/${String(i).padStart(3, '0')}.png`, png(s));
}
console.log(N + 1, 'frames', long.toFixed(2), 's');
