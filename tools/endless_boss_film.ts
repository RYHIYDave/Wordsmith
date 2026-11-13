// ENDLESS MODE'S FINAL BOSS: A MOVE AS A FILM (src/art/endless_boss.ts), painted as the game paints its monsters, no browser. The
// boss on a floor of dark flags, carried over it as the game carries him (a charge), the warning marked on the floor while he
// holds it (the rules are the main chat's: here only to show it), his strike smeared, his lights laid soft over the dark.
//   npx tsx tools/endless_boss_film.ts <out dir> <move> <front|rear> [w h]   writes <out dir>/f/000.png ... at one picture pixel a
//   game pixel (the film is made from them with ffmpeg)
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { CHARGE, CHARGE_SKID, CHARGE_STRIKE, GORE, GORE_STRIKE, WHEEL, WS_CANVAS, boarPoseAt, chargeCarry, chargeSmeared, goreSmeared, wsMob } from '../src/art/endless_boss';
import { png } from './king_png';

const [out = '/tmp/wsfilm', move = 'charge', view0 = 'front', w0 = '420', h0 = '300'] = process.argv.slice(2);
const view = view0 as 'front' | 'rear';
void view;
const W = Number(w0);
const H = Number(h0);
const TILE = 32 / Math.sqrt(2 / 3);
mkdirSync(`${out}/f`, { recursive: true });
const mob = wsMob();
// (the floor as seen from in front: a move seen from behind is him turned round on it)
const st = stage(paintViewOf(mob, 'front'), WS_CANVAS.ax, WS_CANVAS.ay, WS_CANVAS);
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
function lane(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const [s0] = CHARGE_STRIKE;
  if (t < 0.15 || t > s0 + 0.05) return;
  const a = Math.min(1, (t - 0.15) / 0.2) * (t > s0 ? 0.5 : 1);
  const L = CHARGE.lane * TILE;
  const half = CHARGE.half * TILE;
  for (let i = 0; i <= 260; i++) {
    for (let j = -12; j <= 12; j++) {
      const f = i / 260;
      const side = j / 12;
      const [x, y] = at([from[0] + dir * f * L, from[1] + side * half, 0]);
      const edge = Math.abs(side) > 0.86;
      // (chevrons running down it, toward where he will go)
      const ch = (f * 26 - t * 5 - Math.abs(side) * 1.2) % 1;
      const on = edge ? 0.55 : ch > 0 && ch < 0.22 ? 0.32 : 0.12;
      mix(s, Math.round(ox + x), Math.round(oy + y), '#ff4f8a', on * a * (1 - 0.3 * f));
    }
  }
}
/** The gore's sweep, marked while it winds up and holds: a fan of the enemy's pink before it, its edge bright. */
function sweep(s: Px, t: number, ox: number, oy: number, from: V2, dir: number): void {
  const [s0] = GORE_STRIKE;
  if (t < 0.12 || t > s0 + 0.06) return;
  const a = Math.min(1, (t - 0.12) / 0.15) * (t > s0 ? 0.5 : 1);
  const R = GORE.reach * TILE;
  const half = (GORE.arc / 2) * (Math.PI / 180);
  for (let i = 0; i <= 90; i++) {
    for (let j = 0; j <= 60; j++) {
      const ang = -half + (2 * half * i) / 90;
      const r = (R * j) / 60;
      const [x, y] = at([from[0] + dir * (30 + r * Math.cos(ang)), from[1] + dir * r * Math.sin(ang), 0]);
      const edge = j > 56;
      const ring = ((r / R) * 6 - t * 3) % 1;
      const on = edge ? 0.55 : ring > 0 && ring < 0.18 ? 0.3 : 0.1;
      mix(s, Math.round(ox + x), Math.round(oy + y), '#ff4f8a', on * a);
    }
  }
}
/** His picture laid on the floor at (ox, oy): his painted pixels, then his lights soft over them. */
function lay(s: Px, mv: string, vw: 'front' | 'rear', t: number, ox: number, oy: number, ghost = 0): void {
  const { px, lights } = paintMob(mob, mv, t, vw);
  const x0 = Math.round(ox - WS_CANVAS.ax);
  const y0 = Math.round(oy - WS_CANVAS.ay);
  // (seen from behind going back up the lane: the game's from-behind picture, turned over left for right as the game turns it)
  const flip = vw === 'rear';
  const fx = (x: number): number => (flip ? 2 * WS_CANVAS.ax - x : x);
  for (let y = 0; y < px.h; y++) {
    for (let xx = 0; xx < px.w; xx++) {
      const x = fx(xx);
      const c = px.get(xx, y);
      if (!c) continue;
      if (ghost) mix(s, x0 + x, y0 + y, c, ghost);
      else if (x0 + x >= 0 && y0 + y >= 0 && x0 + x < W && y0 + y < H) s.set(x0 + x, y0 + y, c);
    }
  }
  if (ghost) return;
  for (const l0 of lights) {
    const l = { ...l0, x: fx(l0.x) };
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
type V2 = [number, number];
/** A piece of the film: a move, from which side he is seen (from behind, he is turned round: the way he goes is the floor's other
 * way), where on the floor it starts, how much faster than itself it plays. */
interface Seg {
  move: string;
  view: 'front' | 'rear';
  from: V2;
  speed: number;
  long: number;
  /** where his floor point is, as the move's own points are, at `t` (a charge carries him; a wheel turns him round his forehand) */
  floorAt: (t: number) => V2;
}
const floorOf = (mv: string) => (t: number): V2 => {
  if (mv === 'charge') return [chargeCarry(t) * TILE, 0];
  if (mv === 'wheel') {
    const P = boarPoseAt('wheel', t);
    return [P.x, P.y];
  }
  return [0, 0];
};
const longOf = (mv: string): number => (mv === 'charge' ? CHARGE.long : mv === 'wheel' ? WHEEL.long : mv === 'gore' ? GORE.long : 3);
/** The film: one move, or (charge3) three runs, wheeling round between, each faster. */
const segs: Seg[] = [];
{
  const plan: [string, 'front' | 'rear', number][] = move === 'charge3'
    ? [['charge', 'front', 1], ['wheel', 'front', 1], ['charge', 'rear', 1.15], ['wheel', 'rear', 1.15], ['charge', 'front', 1.3]]
    : [[move, view, 1]];
  let from: V2 = [0, 0];
  for (const [mv, vw, speed] of plan) {
    const f = floorOf(mv);
    const sg: Seg = { move: mv, view: vw, from, speed, long: longOf(mv) / speed, floorAt: f };
    segs.push(sg);
    const e = f(longOf(mv));
    const k = vw === 'front' ? 1 : -1;
    from = [from[0] + k * e[0], from[1] + k * e[1]];
  }
}
let camX = 0;
let camY = 0;
let i = 0;
for (const sg of segs) {
  const n = Math.round(sg.long * 30);
  const k = sg.view === 'front' ? 1 : -1;
  for (let j = 0; j <= n; j++, i++) {
    const t = Math.min(longOf(sg.move), (j / 30) * sg.speed);
    const world = (tt: number): [number, number, number] => {
      const f = sg.floorAt(tt);
      return [sg.from[0] + k * f[0], sg.from[1] + k * f[1], 0];
    };
    const [tx, ty] = at(world(t));
    camX += (tx - camX) * (i === 0 ? 1 : 0.32);
    camY += (ty - camY) * (i === 0 ? 1 : 0.32);
    // (the screen kicks as it bursts off and as it digs in to stop: his rulebook's Animations, “the screen kicks on big casts and hits”)
    const kick = sg.move === 'charge' ? Math.max(0, 1 - Math.abs(t - CHARGE_STRIKE[1]) / 0.1) * 3 + Math.max(0, 1 - Math.abs(t - CHARGE_SKID[0] - 0.1) / 0.12) * 2 : sg.move === 'gore' ? Math.max(0, 1 - Math.abs(t - GORE.hit - 0.02) / 0.12) * 4 : 0;
    const ox = sx - Math.round(camX) + Math.round(kick * Math.sin(i * 2.7));
    const oy = sy - Math.round(camY) + Math.round(kick * Math.cos(i * 3.1));
    const s = floor(-ox, -oy);
    if (sg.move === 'charge') lane(s, t, ox, oy, sg.from, k);
    if (sg.move === 'gore') sweep(s, t, ox, oy, sg.from, k);
    const where = (tt: number): [number, number] => {
      const [x, y] = at(world(tt));
      return [ox + x, oy + y];
    };
    // (the move's own picture is drawn about its floor point as it stands at nothing: placed at where the segment starts)
    const base = (): [number, number] => {
      const [x, y] = at([sg.from[0], sg.from[1], 0]);
      return [ox + x, oy + y];
    };
    if (sg.move === 'charge' && chargeSmeared(t)) {
      for (const [m, a] of [[3, 0.18], [2, 0.3], [1, 0.45]] as const) {
        const [x, y] = where(t - m * (1 / 90));
        lay(s, sg.move, sg.view, t, x, y, a);
      }
    }
    if (sg.move === 'gore' && goreSmeared(t)) {
      // (its strike smeared: after-images of its head hooking through, fading)
      const [x, y] = base();
      for (const [m, a] of [[2, 0.25], [1, 0.45]] as const) lay(s, sg.move, sg.view, t - m * (1 / 90), x, y, a);
    }
    if (sg.move === 'wheel' || sg.move === 'gore') {
      const [x, y] = base();
      lay(s, sg.move, sg.view, t, x, y);
    } else {
      const [x, y] = where(t);
      lay(s, sg.move, sg.view, t, x, y);
    }
    writeFileSync(`${out}/f/${String(i).padStart(3, '0')}.png`, png(s));
  }
}
const N = i - 1;
const long = segs.reduce((a, b) => a + b.long, 0);
console.log(N + 1, 'frames', long.toFixed(2), 's');
