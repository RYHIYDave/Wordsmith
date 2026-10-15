// Dev page: FLOOR 9'S BOSS, THE HOLLOW STAG (art/hollow_stag.ts), for the owner to look at. Nothing of the game
// imports it.
//
//   node tools/preview.mjs src/dev/preview_hollow_stag.ts shots/stag_look.png 1014 820 look
//     it standing, from in front and from behind, the knight beside it at the game's size; close-ups of it
//   node tools/page_gif.mjs src/dev/preview_hollow_stag.ts "standfilm" shots/stag_stand.gif 6
//     A FILM (15 frames a second): its restless stand, from in front and from behind, at four times the game's size
//   node tools/page_gif.mjs src/dev/preview_hollow_stag.ts "walkfilm" shots/stag_walk.gif 6
//     FILMS of its moves as the game plays them, from in front and from behind, at three times the game's size:
//     walkfilm, gorefilm (its antler gore, then struck), chargefilm (into a pine), rootsfilm (its lines of roots),
//     bellowfilm, deathfilm
//   frames:move:t1,t2,...   several moments of one move side by side, from in front above and from behind below
//   big:move:t:scale[:raw]   one moment large, from in front and from behind

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { ROOT_CANVAS, STAG_BELLOW, STAG_CANVAS, STAG_CHARGE, STAG_DIE, STAG_GORE, STAG_HABITS, STAG_PACE, STAG_REEL, STAG_ROOTS, STAG_STAND, STAG_WALK, rootBurstPainted, stagFrame, stagPainted, stagRootTime } from '../art/hollow_stag';
import { pinewoodPieces } from '../art/floor9';
import { TILE3 } from '../art/new_mobs3';
import { project } from '../art/skeleton';
import { toSprite } from '../art/kit';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.05);

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The Pinewood's meadow grass, plain, as a floor under it. */
function meadow(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#536638';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4c5e33';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}

/** A sprite's lights, added over the picture as the game adds them (its eye's glow), at `k` times the game's size. */
function litAt(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const L of sp.lights ?? []) {
    const lx = x + (L.x - sp.ax) * k;
    const ly = y + (L.y - sp.ay) * k;
    const r = L.r * k;
    const gr = g.createRadialGradient(lx, ly, 1, lx, ly, r);
    gr.addColorStop(0, hexA(L.color, (L.a ?? 0.5) * 0.55));
    gr.addColorStop(1, hexA(L.color, 0));
    g.fillStyle = gr;
    g.fillRect(lx - r, ly - r, 2 * r, 2 * r);
  }
  g.restore();
}
function hexA(c: string, a: number): string {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function look(): void {
  const H = 820;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, PW, H);
  const FOOT = 270;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(25, 18, 40, 0.3)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const front = stagFrame('stand', T, 'front');
  const back = stagFrame('stand', T, 'back');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    litAt(g, sp, x, FOOT, 2);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 130, 26, 'the knight');
  put(front, 440, 70, 'from in front');
  put(back, 800, 70, 'from behind');
  label(g, 'The Hollow Stag, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * 3), Math.round(770 - sp.ay * 3), sp.w * 3, sp.h * 3);
    litAt(g, sp, x, 770, 3);
    label(g, name, x - name.length * 5, 786);
  };
  big(front, 250, 'from in front, close');
  big(back, 760, 'from behind, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function standFilm(): void {
  const fps = STAG_STAND.fps;
  const n = STAG_STAND.frames;
  const PANE = 600;
  const TOP = 30;
  const PH = 640;
  const cvs = document.createElement('canvas');
  cvs.width = PANE * 2;
  cvs.height = TOP + PH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const said = (t: number): string => {
    const [a, b] = STAG_HABITS.toss;
    if (t >= a && t < b) return 'tosses its head';
    if (t >= STAG_HABITS.paw[0] && t < STAG_HABITS.paw[1] + 0.12) return 'paws and stamps';
    if (t >= STAG_HABITS.snort - 0.2 && t < STAG_HABITS.snort + 0.22) return 'snorts';
    if (t >= STAG_HABITS.blink[0] && t < STAG_HABITS.blink[1]) return 'blinks';
    return '';
  };
  const draw = (i: number): void => {
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, 'The Hollow Stag stands, restless (four times the game\'s size)', 8, 6);
    const note = said(i / fps);
    if (note) label(g, note, cvs.width - note.length * 10 - 12, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE - 4, PH - 2);
      g.clip();
      g.translate(ox, TOP);
      meadow(g, PANE, PH);
      g.translate(-ox, -TOP);
      const fx = ox + PANE / 2 - 20;
      const fy = TOP + 560;
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 170, 68, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(stagPainted('stand', i / fps, view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * 4), Math.round(fy - sp.ay * 4), sp.w * 4, sp.h * 4);
      litAt(g, sp, fx, fy, 4);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PH - 26);
    });
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}

/** What it does at each moment of a film: which move, how far into it, how far it has come over the floor. */
type Beat = { move: string; t: number; ground: number };
function beatsOf(run: ReadonlyArray<readonly [string, number]>, fps: number): Beat[] {
  const out: Beat[] = [];
  let ground = 0;
  let breath = 0;
  let stride = 0;
  for (const [mv, long] of run) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      out.push({ move: mv, t: mv === 'stand' ? breath + t : mv === 'walk' ? stride + t : t, ground });
      if (mv === 'walk') ground += (STAG_PACE * TILE3) / fps;
      if (mv === 'charge' && t >= STAG_CHARGE.run && t < STAG_CHARGE.crash) ground += (STAG_CHARGE.pace * TILE3) / fps;
    }
    if (mv === 'stand') breath += n / fps;
    if (mv === 'walk') stride += n / fps;
  }
  return out;
}
/** Something drawn in a film beside it, at a place on the floor (its own lengths, forward and to its left), before or behind it as it is nearer or further. */
type Extra = { at: [number, number]; sp: Sprite; k?: number };
function film(beats: Beat[], fps: number, title: string, o: { w: number; h: number; fx: number; fy: number; k: number }, note?: (b: Beat) => string, extras?: (b: Beat, view: 'front' | 'back') => Extra[]): void {
  const TOP = 30;
  const cvs = document.createElement('canvas');
  cvs.width = o.w * 2;
  cvs.height = TOP + o.h;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const K = o.k;
  const draw = (i: number): void => {
    const b = beats[i];
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, title, 8, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * o.w;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, o.w - 4, o.h - 2);
      g.clip();
      g.translate(ox, TOP);
      meadow(g, o.w, o.h);
      g.translate(-ox, -TOP);
      const [dx, dy] = project([b.ground, 0, 0], view);
      // (its sprites are in game pixels, two picture pixels each; the floor's places are in picture pixels)
      const fx = ox + o.fx + (dx * K) / 2;
      const fy = TOP + o.fy + (dy * K) / 2;
      const placed = (extras?.(b, view) ?? []).map((e) => {
        const [ex, ey, near] = project([e.at[0], e.at[1], 0], view);
        return { e, x: ox + o.fx + (ex * K) / 2, y: TOP + o.fy + (ey * K) / 2, near };
      });
      const [, , meNear] = project([b.ground, 0, 0], view);
      const put = (sp: Sprite, x: number, y: number, kk: number): void => {
        g.drawImage(sp.img, Math.round(x - sp.ax * kk), Math.round(y - sp.ay * kk), sp.w * kk, sp.h * kk);
      };
      for (const p of placed) if (p.near <= meNear) put(p.e.sp, p.x, p.y, (p.e.k ?? 1) * K);
      g.fillStyle = 'rgba(25, 18, 40, 0.3)';
      g.beginPath();
      g.ellipse(fx, fy, 24 * K, 10 * K, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(stagPainted(b.move, b.t, view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
      put(sp, fx, fy, K);
      for (const p of placed) if (p.near > meNear) put(p.e.sp, p.x, p.y, (p.e.k ?? 1) * K);
      litAt(g, sp, fx, fy, K);
      for (const p of placed) litAt(g, p.e.sp, p.x, p.y, (p.e.k ?? 1) * K);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + o.h - 26);
    });
    const said = note?.(b);
    if (said) label(g, said, cvs.width - said.length * 10 - 12, 6);
  };
  draw(0);
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  win.__frames = beats.length;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
  win.__ready = true;
}
const hold = (beats: Beat[], n: number): Beat[] => {
  const last = beats[beats.length - 1];
  for (let i = 0; i < n; i++) beats.push({ ...last });
  return beats;
};

if (HASH.startsWith('look')) look();
else if (HASH === 'standfilm') standFilm();
else if (HASH === 'walkfilm') {
  const fps = STAG_WALK.fps;
  film(beatsOf([['stand', 0.5], ['walk', STAG_WALK.period * 2], ['stand', 0.5]], fps), fps, 'The Hollow Stag walks, slow and heavy (at its pace)', { w: 700, h: 640, fx: 200, fy: 520, k: 3 });
} else if (HASH === 'gorefilm') {
  const G = STAG_GORE;
  const at = (b: Beat): string => (b.move === 'attack' ? (b.t >= G.warn && b.t < G.thrust ? 'antlers aimed, trembling' : b.t >= G.hit && b.t < G.hit + G.freeze ? 'the gore' : '') : b.move === 'reel' ? 'struck' : '');
  film(beatsOf([['stand', 0.4], ['attack', G.long], ['stand', 0.5], ['reel', STAG_REEL.long], ['stand', 0.4]], 30), 30, 'The Hollow Stag: its antler gore, then struck', { w: 700, h: 640, fx: 280, fy: 520, k: 3 }, at);
} else if (HASH === 'chargefilm') {
  const C = STAG_CHARGE;
  const pieces = pinewoodPieces();
  const pine = (pieces.find((p) => p.name === 'old pine')?.frames ?? [])[0] as unknown as Sprite;
  const stump = (pieces.find((p) => p.name === 'stump')?.frames ?? [])[0] as unknown as Sprite;
  const spot = C.pace * TILE3 * (C.crash - C.run) + 62;
  const at = (b: Beat): string => (b.move === 'charge' ? (b.t >= C.warn && b.t < C.run ? 'head low, pawing' : b.t >= C.run && b.t < C.crash ? 'the charge' : b.t >= C.crash && b.t < C.crash + 0.5 ? 'the pine splinters' : '') : '');
  const beats = hold(beatsOf([['stand', 0.4], ['charge', C.long], ['stand', 0.4]], 30), 10);
  film(beats, 30, 'The Hollow Stag: its charge, into a pine', { w: 820, h: 700, fx: 150, fy: 430, k: 2.2 }, at, (b) => [{ at: [spot, 0], sp: b.move === 'charge' && b.t < C.crash ? pine : b.move === 'stand' && beats.indexOf(b) < 12 ? pine : stump }]);
} else if (HASH === 'rootsfilm') {
  const R = STAG_ROOTS;
  const lines = [-24, 0, 24];
  const at = (b: Beat): string => (b.move === 'roots' ? (b.t >= R.rear && b.t < 0.85 ? 'reared up' : b.t >= R.slam && b.t < R.slam + R.freeze ? 'the slam' : b.t >= R.slam + R.freeze && b.t < 2.2 ? 'roots burst toward you' : '') : '');
  const bursts = (b: Beat, view: 'front' | 'back'): Extra[] => {
    if (b.move !== 'roots') return [];
    const out: Extra[] = [];
    lines.forEach((deg, j) => {
      for (let d = 1.2; d <= R.reach + 1e-9; d += 0.6) {
        const tt = b.t - stagRootTime(d);
        if (tt < -0.3 || tt > 0.85) continue;
        const a = (deg * Math.PI) / 180;
        out.push({ at: [Math.cos(a) * d * TILE3, Math.sin(a) * d * TILE3], sp: toSprite(rootBurstPainted(tt, view, j * 13 + Math.round(d * 10)), null, ROOT_CANVAS.ax, ROOT_CANVAS.ay), k: 1 });
      }
    });
    return out;
  };
  film(beatsOf([['stand', 0.3], ['roots', R.long], ['stand', 0.4]], 30), 30, 'The Hollow Stag: lines of roots burst toward you', { w: 840, h: 720, fx: 170, fy: 430, k: 2 }, at, bursts);
} else if (HASH === 'bellowfilm') {
  const B = STAG_BELLOW;
  const at = (b: Beat): string => (b.move === 'bellow' ? (b.t >= B.warn && b.t < B.roar ? 'head thrown up' : b.t >= B.roar && b.t < B.quiet ? 'the bellow' : '') : '');
  film(beatsOf([['stand', 0.4], ['bellow', B.long], ['stand', 0.4]], 30), 30, 'The Hollow Stag: its bellow (the wolves answer from the fog)', { w: 700, h: 640, fx: 300, fy: 520, k: 3 }, at);
} else if (HASH === 'deathfilm') {
  const Dd = STAG_DIE;
  const at = (b: Beat): string => (b.move === 'dying' ? (b.t < Dd.freeze ? 'struck' : b.t < Dd.sink ? 'roots burst up round it' : b.t < Dd.under ? 'dragged down' : '') : '');
  film(hold(beatsOf([['stand', 0.4], ['dying', Dd.long]], 30), 18), 30, 'The Hollow Stag: roots drag it down into the ground', { w: 700, h: 640, fx: 300, fy: 520, k: 3 }, at);
}
else if (HASH.startsWith('big:')) {
  // (one moment large, from in front and from behind: `big:move:t:scale`, the scale in picture pixels)
  const [, mv, at, k0, raw] = HASH.split(':');
  const K = Number(k0 ?? 3) * 2;
  const W0 = Math.round(STAG_CANVAS.w * K * 0.5);
  const H0 = Math.round(STAG_CANVAS.h * K * 0.5);
  const cvs = document.createElement('canvas');
  cvs.width = W0 * 2;
  cvs.height = H0;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, cvs.width, cvs.height);
  (['front', 'back'] as const).forEach((view, k) => {
    const sp = toSprite(stagPainted(mv, Number(at), view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
    g.drawImage(sp.img, Math.round(k * W0 + STAG_CANVAS.ax * K * 0.5 - sp.ax * K), Math.round(STAG_CANVAS.ay * K * 0.5 - sp.ay * K), sp.w * K, sp.h * K);
    if (raw !== 'raw') litAt(g, sp, k * W0 + STAG_CANVAS.ax * K * 0.5, STAG_CANVAS.ay * K * 0.5, K);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
} else if (HASH.startsWith('frames:')) {
  // (several moments of one move side by side, from in front above and from behind below: `frames:move:t1,t2,...`)
  const [, mv, list] = HASH.split(':');
  const ts = list.split(',').map(Number);
  const cw = 330;
  const cvs = document.createElement('canvas');
  cvs.width = cw * ts.length;
  cvs.height = 900;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  meadow(g, cvs.width, cvs.height);
  ts.forEach((t, i) => {
    (['front', 'back'] as const).forEach((view, k) => {
      const sp = toSprite(stagPainted(mv, t, view), null, STAG_CANVAS.ax, STAG_CANVAS.ay);
      const fx = i * cw + cw / 2 - 10;
      const fy = 400 + k * 440;
      g.drawImage(sp.img, Math.round(fx - sp.ax * 2), Math.round(fy - sp.ay * 2), sp.w * 2, sp.h * 2);
    });
    label(g, `${t.toFixed(2)} s`, i * cw + 8, 6);
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}
