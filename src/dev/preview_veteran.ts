// Dev page: THE VETERAN, PICTURES FIRST (dev/sculpt_veteran.ts, dev/veteran_globes.ts). NOT IN THE GAME: still pictures for
// the owner. Him from in front, from behind and from the side, bouncing on his toes, three times the game's size beside
// the knight and at the game's size; his five key poses, each its held wind-up and its strike; the combo globes.
//   node tools/preview.mjs src/dev/preview_veteran.ts docs/mockups/brawler_looks/pictures/veteran.png 1200 100
// (The knight is the game's own, painted by its own painter, only to stand beside him for size.)
import { paintMove3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import { add, lerp3, mul, solve, standing } from '../art/skeleton';
import type { Posed, V3 } from '../art/skeleton';
import { Px, rgba } from '../engine/px';
import { VET_BUILD, VET_CANVAS, VET_MOVES, VET_STANCE, VET_STANCE_UP, paintVeteran } from './sculpt_veteran';
import type { VetMove, VetPose } from './sculpt_veteran';
import { GLOBES_H, GLOBES_W, GLOBE_STATES, paintGlobes } from './veteran_globes';
import type { GlobeRow } from './veteran_globes';

const S = 3;
const W = 1200;
const BG = '#17142e';
const PANEL = ['#262354', '#211e4b'];
const GOLD = '#ffd866';
const TEXT = '#e4e0ff';
const SOFT = '#a8a2d8';
const FLOOR = '#3a3676';
const INTRO = 'An old fighter, muscled and cut, bouncing on his toes. His left eye milky and blind, a scar running down through it; a grey walrus moustache and beard; a long faded red headband streaming out behind him. Nothing of the old Brawler. Still pictures only: not in the game.';

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const wd of text.split(' ')) {
    const t = line ? `${line} ${wd}` : wd;
    if (g.measureText(t).width > maxW && line) {
      out.push(line);
      line = wd;
    } else line = t;
  }
  if (line) out.push(line);
  return out;
}

/** A painting's columns that hold anything, between two rows (its width, cropped to it). */
function spanOf(px: Px, y0: number, y1: number): [number, number] {
  let a = px.w;
  let b = -1;
  for (let y = Math.max(0, y0); y < Math.min(px.h, y1); y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3]) {
    a = Math.min(a, x);
    b = Math.max(b, x);
  }
  return b < 0 ? [0, px.w - 1] : [a, b];
}

/**
 * THE STRIKE'S AFTER-IMAGE: the path of the part that strikes, from the wind-up to the strike, bowed as the move bows it
 * (a hook comes round, an uppercut up); a spinning kick's is an arc right round him at the height of the kick. What of it
 * passes behind him is painted under him, what passes in front over him.
 */
function smearOf(m: VetMove, at: (p: V3) => [number, number], near: (p: V3) => number): { under: Px; over: Px } {
  const B = VET_BUILD;
  const solved = (p: VetPose) => solve(B, { ...standing(B), ...p.bones } as Posed);
  const sb = solved(m.strike);
  const a = solved(m.windup)[m.smear.joint];
  const b = sb[m.smear.joint];
  const c = add(lerp3(a, b, 0.5), m.smear.bulge);
  const D = Math.PI / 180;
  const path = (t: number): V3 => {
    if (m.smear.spin) {
      const cx = sb.pelvis[0];
      const cy = sb.pelvis[1];
      const R = Math.hypot(b[0] - cx, b[1] - cy);
      const th = Math.atan2(b[1] - cy, b[0] - cx) - m.smear.spin * (1 - t) * D;
      return [cx + Math.cos(th) * R * (0.75 + 0.25 * t), cy + Math.sin(th) * R * (0.75 + 0.25 * t), b[2] - (1 - t) * 6];
    }
    return add(add(mul(a, (1 - t) * (1 - t)), mul(c, 2 * t * (1 - t))), mul(b, t * t));
  };
  const under = new Px(VET_CANVAS.w, VET_CANVAS.h);
  const over = new Px(VET_CANVAS.w, VET_CANVAS.h);
  const put = (px: Px, x: number, y: number, col: string): void => {
    if (x < 0 || y < 0 || x >= px.w || y >= px.h) return;
    const v = rgba(col);
    const i = (y * px.w + x) * 4;
    px.d[i] = v[0];
    px.d[i + 1] = v[1];
    px.d[i + 2] = v[2];
    px.d[i + 3] = 255;
  };
  const t0 = m.smear.spin ? 0.08 : 0.28;
  const t1 = 0.9;
  const mid = near(sb.pelvis);
  const pts: [number, number, number, boolean][] = [];
  for (let i = 0; i <= 120; i++) {
    const t = t0 + (i / 120) * (t1 - t0);
    const p = path(t);
    const [x, y] = at(p);
    const behind = m.smear.joint === 'pelvis' || near(p) < mid;
    pts.push([x, y, 0.5 + 2.0 * Math.pow((t - t0) / (t1 - t0), 1.4), behind]);
  }
  // (two passes: the soft lavender edge, then the pale core over it)
  for (const [edge, col] of [[1.0, '#7e78c4'], [0, '#e6e4ff']] as const) {
    for (const [x, y, r, behind] of pts) {
      const R = r + edge - (edge ? 0 : 0.6);
      for (let yy = Math.floor(y - R); yy <= Math.ceil(y + R); yy++) for (let xx = Math.floor(x - R); xx <= Math.ceil(x + R); xx++) {
        if ((xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 <= R * R) put(behind ? under : over, xx, yy, col);
      }
    }
  }
  return { under, over };
}

/** A shadow on the floor under him when he is off it (so the leap reads). */
function shadowOf(cx: number, cy: number, half: number): Px {
  const px = new Px(VET_CANVAS.w, VET_CANVAS.h);
  const v = rgba('#0c0a20');
  for (let y = -3; y <= 3; y++) for (let x = -half; x <= half; x++) {
    if ((x / half) ** 2 + (y / 3.2) ** 2 > 1) continue;
    const i = ((cy + y) * px.w + cx + x) * 4;
    px.d[i] = v[0];
    px.d[i + 1] = v[1];
    px.d[i + 2] = v[2];
    px.d[i + 3] = 255;
  }
  return px;
}

const build = (): void => {
  const knight = paintMove3(MOVES3.ktown, 0, 'front').px;
  const down = paintVeteran(VET_STANCE, 0);
  const up = paintVeteran(VET_STANCE_UP, 0);
  const behind = paintVeteran(VET_STANCE, 90);
  const side = paintVeteran(VET_STANCE_UP, 45);
  const moves = VET_MOVES.map((m) => ({ m, w: paintVeteran(m.windup, 45), s: paintVeteran(m.strike, 45) }));

  const cv = document.createElement('canvas');
  for (const el of [document.documentElement, document.body]) {
    el.style.height = 'auto';
    el.style.overflow = 'visible';
  }
  document.body.style.margin = '0';
  document.body.style.background = BG;
  cv.style.display = 'block';
  document.body.appendChild(cv);

  // the heights of things
  const UP = 82;
  const DOWN = 8;
  const MUP_MAX = 104;
  /** How far above the floor each move's pictures reach (each row only as tall as it needs). */
  const topRow = (px: Px): number => {
    for (let yy = 0; yy < px.h; yy++) for (let xx = 0; xx < px.w; xx++) if (px.d[(yy * px.w + xx) * 4 + 3]) return yy;
    return px.h;
  };
  const ups = moves.map(({ w, s }) => Math.min(MUP_MAX, VET_CANVAS.ay - Math.min(topRow(w.px), topRow(s.px)) + 4));
  const MDOWN = 8;
  let HEADER = 120;
  const A_H = 56 + (UP + DOWN) * S + 46 + (UP + DOWN) + 30;
  const ROW_TEXT = 118;
  const rowH = (i: number): number => ROW_TEXT + (ups[i] + MDOWN) * S + 46;
  const B_H = 70 + moves.reduce((t, _m, i) => t + rowH(i), 0);
  const GUP = 104;
  const CELL_H = 30 + GLOBES_H * S + 16 + GUP + 12 + 74;
  const C_H = 120 + (GUP + DOWN) * S + 40 + 2 * (CELL_H + 14);
  cv.width = W;
  const g0 = cv.getContext('2d') as CanvasRenderingContext2D;
  g0.font = '500 20px system-ui, sans-serif';
  HEADER = 58 + wrap(g0, INTRO, W - 32).length * 27 + 26;
  cv.height = HEADER + A_H + B_H + C_H + 20;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  g.textBaseline = 'top';
  const text = (s: string, x: number, y: number, font: string, col: string): void => {
    g.font = font;
    g.fillStyle = col;
    g.fillText(s, x, y);
  };
  const para = (s: string, x: number, y: number, maxW: number, font: string, col: string, lh: number): number => {
    g.font = font;
    g.fillStyle = col;
    const lines = wrap(g, s, maxW);
    lines.forEach((ln, i) => g.fillText(ln, x, y + i * lh));
    return lines.length * lh;
  };
  /** Paint `px` (its floor point at ax, ay) cropped to columns [c0, c1] and from `up` above the floor to `dn` below, at (x, y), `k` times. */
  const put = (px: Px, ax: number, ay: number, c0: number, c1: number, up: number, dn: number, x: number, y: number, k: number): void => {
    void ax;
    g.drawImage(px.toCanvas(), c0, ay - up, c1 - c0 + 1, up + dn, x, y, (c1 - c0 + 1) * k, (up + dn) * k);
  };
  const floorLine = (x: number, y: number, w: number): void => {
    g.fillStyle = FLOOR;
    g.fillRect(x, y, w, 2);
  };

  // ---- HEADER ----
  text('The Veteran: an action-movie hero, built new', 16, 14, '800 34px system-ui, sans-serif', GOLD);
  para(INTRO, 16, 58, W - 32, '500 20px system-ui, sans-serif', SOFT, 27);

  // ---- A: HIM, BESIDE THE KNIGHT ----
  let y = HEADER;
  text('Him, three times the game size, beside the knight', 16, y, '800 26px system-ui, sans-serif', GOLD);
  y += 44;
  const views = [
    { px: knight, ax: CANVAS3.ax, ay: CANVAS3.ay, label: 'the knight' },
    { px: down.px, ax: VET_CANVAS.ax, ay: VET_CANVAS.ay, label: 'bouncing: down' },
    { px: up.px, ax: VET_CANVAS.ax, ay: VET_CANVAS.ay, label: 'bouncing: up' },
    { px: behind.px, ax: VET_CANVAS.ax, ay: VET_CANVAS.ay, label: 'from behind' },
    { px: side.px, ax: VET_CANVAS.ax, ay: VET_CANVAS.ay, label: 'from the side' },
  ];
  const spans = views.map((v) => {
    const [a, b] = spanOf(v.px, v.ay - UP, v.ay + DOWN);
    return [a - 3, b + 3] as [number, number];
  });
  const total = spans.reduce((t, [a, b]) => t + (b - a + 1) * S, 0);
  const gap = Math.floor((W - 40 - total) / (views.length - 1));
  g.fillStyle = PANEL[0];
  g.fillRect(10, y - 6, W - 20, (UP + DOWN) * S + 12);
  let x = 20;
  views.forEach((v, i) => {
    const [a, b] = spans[i];
    put(v.px, v.ax, v.ay, a, b, UP, DOWN, x, y, S);
    floorLine(x - 4, y + UP * S, (b - a + 1) * S + 8);
    text(v.label, x + 4, y + (UP + DOWN) * S + 10, '600 19px system-ui, sans-serif', SOFT);
    x += (b - a + 1) * S + gap;
  });
  y += (UP + DOWN) * S + 46;
  text('At the game size:', 20, y + 36, '600 19px system-ui, sans-serif', SOFT);
  x = 200;
  views.forEach((v, i) => {
    const [a, b] = spans[i];
    put(v.px, v.ax, v.ay, a, b, UP, DOWN, x, y, 1);
    x += b - a + 1 + 18;
  });
  y = HEADER + A_H;

  // ---- B: HIS FIVE KEY POSES ----
  text('His key poses: each a big held wind-up, then the strike', 16, y, '800 26px system-ui, sans-serif', GOLD);
  para('From the side, as he fights toward the right of the screen. The pale streak shows the path of the blow.', 16, y + 36, W - 32, '500 19px system-ui, sans-serif', SOFT, 26);
  y += 70;
  moves.forEach(({ m, w, s }, i) => {
    const MUP = ups[i];
    const B_ROW = rowH(i);
    const y0 = y + moves.slice(0, i).reduce((t, _m, j) => t + rowH(j), 0);
    g.fillStyle = PANEL[i % 2];
    g.fillRect(10, y0, W - 20, B_ROW - 12);
    text(String(i + 1), 22, y0 + 10, '900 44px system-ui, sans-serif', GOLD);
    text(`${m.name}  (${m.input})`, 70, y0 + 16, '800 27px system-ui, sans-serif', GOLD);
    para(m.line, 70, y0 + 52, W - 100, '500 19px system-ui, sans-serif', TEXT, 25);
    const yb = y0 + ROW_TEXT;
    const at = (p: V3): [number, number] => s.st.at(s.fig.sc.at(p)) as unknown as [number, number];
    const nearOf = (p: V3): number => s.st.near(s.fig.sc.at(p));
    const smear = smearOf(m, at, nearOf);
    const pics: { px: Px[]; label: string }[] = [
      { px: [...(m.windup.air ? [shadowOf(VET_CANVAS.ax, VET_CANVAS.ay, 12)] : []), w.px], label: 'the wind-up (held)' },
      { px: [...(m.strike.air ? [shadowOf(VET_CANVAS.ax + 2, VET_CANVAS.ay, 10)] : []), smear.under, s.px, smear.over], label: m.strike.air ? 'the strike, in the air' : 'the strike' },
    ];
    let xb = 24;
    const smallX: number[] = [];
    pics.forEach((pc) => {
      // (a painting with nothing in it, as an after-image wholly in front, takes no room)
      const spansOf = pc.px.filter((q) => q.d.some((v, k) => k % 4 === 3 && v > 0)).map((q) => spanOf(q, VET_CANVAS.ay - MUP, VET_CANVAS.ay + MDOWN));
      const a = Math.min(...spansOf.map((v) => v[0])) - 3;
      const b = Math.max(...spansOf.map((v) => v[1])) + 3;
      for (const px of pc.px) put(px, VET_CANVAS.ax, VET_CANVAS.ay, a, b, MUP, MDOWN, xb, yb, S);
      floorLine(xb - 4, yb + MUP * S, (b - a + 1) * S + 8);
      text(pc.label, xb + 4, yb + (MUP + MDOWN) * S + 8, '600 18px system-ui, sans-serif', SOFT);
      smallX.push(a, b);
      xb += (b - a + 1) * S + 40;
    });
    // and at the game size
    const xs0 = Math.max(xb + 10, 800);
    text('At the game size:', xs0, yb + MUP * S - MUP - 34, '600 18px system-ui, sans-serif', SOFT);
    let xs = xs0;
    pics.forEach((pc, j) => {
      const a = smallX[j * 2];
      const b = smallX[j * 2 + 1];
      for (const px of pc.px) put(px, VET_CANVAS.ax, VET_CANVAS.ay, a, b, MUP, MDOWN, xs, yb + MUP * S - MUP, 1);
      xs += b - a + 1 + 16;
    });
  });
  y += B_H - 70;

  // ---- C: THE COMBO GLOBES ----
  text('The combo globes: three globes over his head', 16, y, '800 26px system-ui, sans-serif', GOLD);
  para('Green is a punch (a tap), hot orange a kick (a hold), white the jump (a swipe). Three in and the combo locks. A swipe, then a tap or a hold, puts the globe in green or orange fire. Never pink, never gold (the enemy’s).', 16, y + 36, W - 32, '500 19px system-ui, sans-serif', SOFT, 26);
  y += 104;
  const headTop = (d: typeof down): [number, number] => {
    // (the top of his head, and the middle of it across, on his painting)
    const s = d.fig.s;
    const [hx, hy] = d.st.at(d.fig.sc.at(add(s.head, [0, 0, VET_BUILD.headR[2] + 1]))) as unknown as [number, number];
    return [Math.round(hx), Math.round(hy)];
  };
  /** Him with a row of globes over his head, as one painting the size of his canvas. */
  const withGlobes = (d: typeof down, row: GlobeRow): Px => {
    const out = new Px(VET_CANVAS.w, VET_CANVAS.h);
    out.d.set(d.px.d);
    const gl = paintGlobes(row);
    const [hx, hy] = headTop(d);
    const ox = hx - Math.floor(GLOBES_W / 2);
    const oy = hy - GLOBES_H - 3;
    for (let yy = 0; yy < gl.h; yy++) for (let xx = 0; xx < gl.w; xx++) {
      const i = (yy * gl.w + xx) * 4;
      if (!gl.d[i + 3]) continue;
      const o = ((oy + yy) * out.w + ox + xx) * 4;
      if (ox + xx < 0 || oy + yy < 0 || ox + xx >= out.w || oy + yy >= out.h) continue;
      out.d[o] = gl.d[i];
      out.d[o + 1] = gl.d[i + 1];
      out.d[o + 2] = gl.d[i + 2];
      out.d[o + 3] = 255;
    }
    return out;
  };
  // the big picture: him with a locked combo over his head, beside the knight
  {
    const big = withGlobes(down, GLOBE_STATES[4].row);
    g.fillStyle = PANEL[0];
    g.fillRect(10, y - 6, W - 20, (GUP + DOWN) * S + 12);
    const [ka, kb] = spanOf(knight, CANVAS3.ay - GUP, CANVAS3.ay + DOWN);
    put(knight, CANVAS3.ax, CANVAS3.ay, ka - 3, kb + 3, GUP, DOWN, 30, y, S);
    floorLine(26, y + GUP * S, (kb - ka + 7) * S + 8);
    const [a, b] = spanOf(big, VET_CANVAS.ay - GUP, VET_CANVAS.ay + DOWN);
    const xb = 30 + (kb - ka + 7) * S + 30;
    put(big, VET_CANVAS.ax, VET_CANVAS.ay, a - 3, b + 3, GUP, DOWN, xb, y, S);
    floorLine(xb - 4, y + GUP * S, (b - a + 7) * S + 8);
    const tx = xb + (b - a + 7) * S + 40;
    text('Three times the game size', tx, y + 30, '800 24px system-ui, sans-serif', GOLD);
    para('Locked: punch, punch, kick. The globes float over his head and go with him.', tx, y + 70, W - tx - 30, '500 20px system-ui, sans-serif', TEXT, 27);
    text('the knight', 40, y + (GUP + DOWN) * S + 10, '600 18px system-ui, sans-serif', SOFT);
    y += (GUP + DOWN) * S + 40;
  }
  // every state: the globes three times the size, and him at the game size under them
  const cellW = Math.floor((W - 20 - 3 * 10) / 4);
  GLOBE_STATES.forEach((st, i) => {
    const cx0 = 10 + (i % 4) * (cellW + 10);
    const cy0 = y + Math.floor(i / 4) * (CELL_H + 14);
    g.fillStyle = PANEL[(i + Math.floor(i / 4)) % 2];
    g.fillRect(cx0, cy0, cellW, CELL_H);
    text(st.title, cx0 + 12, cy0 + 8, '800 20px system-ui, sans-serif', GOLD);
    const gl = paintGlobes(st.row);
    g.drawImage(gl.toCanvas(), cx0 + Math.floor((cellW - GLOBES_W * S) / 2), cy0 + 36, GLOBES_W * S, GLOBES_H * S);
    const small = withGlobes(down, st.row);
    const [a, b] = spanOf(small, VET_CANVAS.ay - GUP, VET_CANVAS.ay + DOWN);
    const sy = cy0 + 36 + GLOBES_H * S + 12;
    put(small, VET_CANVAS.ax, VET_CANVAS.ay, a - 2, b + 2, GUP, DOWN, cx0 + Math.floor((cellW - (b - a + 5)) / 2), sy, 1);
    para(st.line, cx0 + 12, sy + GUP + DOWN + 6, cellW - 24, '500 17px system-ui, sans-serif', TEXT, 22);
  });
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(build, 50);
else window.addEventListener('load', () => setTimeout(build, 50));
