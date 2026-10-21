// Dev page: FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL (art/scraper.ts, art/quill.ts), for the owner to look at. Nothing
// of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_pair.ts shots/pair_look.png 1014 820 look
//     the two standing, from in front and from behind, the knight beside them at the game's size; close-ups of each

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { RUSH_TILES, SR_CANVAS, SR_BODY_Z, SR_DIE, SR_REEL, SR_RUSH, SR_SCOUR, SR_SNAP, SR_STAND, SR_STRIP, SR_WALK, scraperFrame, scraperPainted, srForward } from '../art/scraper';
import { toSprite } from '../art/kit';
import { pictureOf } from '../art/terrain';
import { LINES_AT, LINE_BURST_AFTER, LINE_BURST_FOR, LINE_STAIN_FOR, RUSH_WAKE_FOR, SCOUR_FOR, SNAP_FOR, STAB_FOR, STRIP_BURST_AFTER, STRIP_FROM, STRIP_TILES, drawInkLine, drawOverwriting, drawRushWake, drawRushWarn, drawScour, drawScourWarn, drawSnap, drawSnapWarn, drawStab, drawStabWarn, drawStrip, drawStripBurst, drawStripWarn } from '../art/pair_shots';
import { TILE3 } from '../art/new_mobs3';
import { QL_CANVAS, QL_BODY_Z, QL_DIE, QL_FLY, QL_FLY_PACE, QL_LAND, QL_LINES, QL_REEL, QL_STAB, QL_STAND, QL_SWOOP, QL_TAKEOFF, QL_WALK, QL_PACE, QL_WRITE, SWOOP_TILES, quillFrame, quillPainted, STAB_AT, SWOOP_NIB, WRITE_AT } from '../art/quill';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';
const T = Number(HASH.split(':')[1] ?? 0.3);

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The Millrace's pulping floor, plain: wet grey flags. */
function floor(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#4a4a42';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#42423b';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(x, y, 64, 32);
}

function look(): void {
  const H = 1100;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  floor(g, PW, H);
  const FOOT = 250;
  const shadow = (x: number, rx: number): void => {
    g.fillStyle = 'rgba(20, 18, 30, 0.35)';
    g.beginPath();
    g.ellipse(x, FOOT, rx, rx * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const put = (sp: Sprite, x: number, rx: number, name: string): void => {
    shadow(x, rx);
    drawAt(g, sp, x, FOOT);
    label(g, name, x - name.length * 5, FOOT + 24);
  };
  put(knight, 70, 26, 'the knight');
  put(scraperFrame('stand', T, 'front'), 290, 70, 'the Scraper');
  put(scraperFrame('stand', T, 'back'), 560, 70, 'from behind');
  put(quillFrame('stand', T, 'front'), 780, 34, 'the Quill');
  put(quillFrame('stand', T, 'back'), 930, 34, 'from behind');
  label(g, 'Floor 13: the Scraper and the Quill, standing (the row above at the game\'s size)', 8, 6);
  const big = (sp: Sprite, x: number, y: number, k: number, name: string): void => {
    g.drawImage(sp.img, Math.round(x - sp.ax * k), Math.round(y - sp.ay * k), sp.w * k, sp.h * k);
    label(g, name, x - name.length * 5, y + 24);
  };
  big(scraperFrame('stand', T, 'front'), 290, 1040, 4.2, 'the Scraper, close');
  big(quillFrame('stand', T, 'front'), 790, 1040, 3.6, 'the Quill, close');
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}

const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };

/** A FILM of one of them, every move one after another, from in front and from behind (`film:scraper`). */
function film(who: string): void {
  const run: [string, number, string][] =
    who === 'scraper'
      ? [
          ['stand', SR_STAND.period, 'stand'],
          ['walk', SR_WALK.period * 2, 'walk'],
          ['attack', SR_SNAP.long, 'claw snap'],
          ['stand', 0.4, ''],
          ['scour', SR_SCOUR.long, 'the scour'],
          ['stand', 0.4, ''],
          ['rush', SR_RUSH.long, 'the backward rush'],
          ['stand', 0.4, ''],
          ['strip', SR_STRIP.long, 'the palimpsest (its half)'],
          ['reel', SR_REEL.long, 'struck'],
          ['reel', SR_REEL.long, 'struck'],
          ['dying', SR_DIE.long + 0.6, 'death'],
        ]
      : [];
  const fps = 30;
  const beats: { mv: string; t: number; name: string; back: number }[] = [];
  let back = 0;
  for (const [mv, long, name] of run) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      // (the rush: the game carries it back RUSH_TILES between go and stop)
      const b = mv === 'rush' ? RUSH_TILES * TILE3 * Math.max(0, Math.min(1, (t - SR_RUSH.go) / (SR_RUSH.stop - SR_RUSH.go))) : 0;
      beats.push({ mv, t: Math.min(t, long - 1e-6), name, back: back + b });
    }
    if (mv === 'rush') back += RUSH_TILES * TILE3;
  }
  // (back to where it began over the next beats, so that it stays in the pane: walked forward again while it stands)
  const PANE = 760;
  const TOP = 30;
  const PH = 540;
  const K = 3;
  const cvs = document.createElement('canvas');
  cvs.width = PANE * 2;
  cvs.height = TOP + PH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const B = beats[i];
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, `The Scraper: ${B.name || 'stand'}  (one and a half times the game's size)`, 8, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE - 4, PH - 2);
      g.clip();
      g.translate(ox, TOP);
      floor(g, PANE, PH);
      g.translate(-ox, -TOP);
      const [dx, dy] = srForward(view);
      const off = B.back - (B.mv === 'rush' ? 0 : 0);
      const fx = ox + PANE / 2 + dx * (RUSH_TILES * TILE3 * 0.5 - off) * (K / 2) * (B.mv === 'rush' || B.back > 0 ? 1 : 0);
      const fy = TOP + 360 + dy * (RUSH_TILES * TILE3 * 0.5 - off) * (K / 2) * (B.mv === 'rush' || B.back > 0 ? 1 : 0);
      g.fillStyle = 'rgba(20, 18, 30, 0.35)';
      g.beginPath();
      g.ellipse(fx, fy, 150, 60, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(scraperPainted(B.mv, B.t, view), null, SR_CANVAS.ax, SR_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * K), Math.round(fy - sp.ay * K), sp.w * K, sp.h * K);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PH - 26);
    });
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

/** A FILM of the Quill, every move one after another, from in front and from behind (`film:quill`): moved over the floor as the game will carry it (its wade, its flight, its swoop). */
function filmQuill(): void {
  const U = TILE3;
  const lin = (from: number, to: number, a: number, b: number) => (t: number): number => from + (to - from) * Math.max(0, Math.min(1, (t - a) / (b - a)));
  // each scene: its moves one after another, [move, seconds, name, how far the game has carried it (units) at t]
  const scenes: [string, number, string, (t: number) => number][][] = [
    [
      ['stand', QL_STAND.period, 'stand', () => 0],
      ['walk', QL_WALK.period * 2, 'wade', (t) => QL_PACE * U * t],
    ],
    [
      ['attack', QL_STAB.long, 'the nib stab', () => 0],
      ['stand', 0.5, '', () => 0],
    ],
    [
      ['lines', QL_LINES.long, 'ink lines', () => 0],
      ['stand', 0.5, '', () => 0],
    ],
    [
      ['takeoff', QL_TAKEOFF.long, 'overwrite: it takes off', () => 0],
      ['fly', QL_FLY.period * 2, 'overwrite: it flies', (t) => QL_FLY_PACE * U * t],
      ['land', QL_LAND.long, 'overwrite: it lands', () => 0],
      ['write', QL_WRITE.period * 2, 'overwrite: it writes', () => 0],
      ['reel', QL_REEL.long, 'overwrite: struck, it stops', () => 0],
      ['stand', 0.5, '', () => 0],
    ],
    [
      ['swoop', QL_SWOOP.long, 'the palimpsest (its half): the swoop', lin(0, SWOOP_TILES * U, QL_SWOOP.go, QL_SWOOP.stop)],
      ['stand', 0.5, '', () => 0],
    ],
    [
      ['reel', QL_REEL.long, 'struck', () => 0],
      ['reel', QL_REEL.long, 'struck', () => 0],
      ['dying', QL_DIE.long + 0.6, 'death', () => 0],
    ],
  ];
  const fps = 30;
  const beats: { mv: string; t: number; name: string; at: number }[] = [];
  for (const scene of scenes) {
    const start = beats.length;
    let carried = 0;
    for (const [mv, long, name, carry] of scene) {
      const n = Math.round(long * fps);
      for (let i = 0; i < n; i++) {
        const t = i / fps;
        beats.push({ mv, t: Math.min(t, long - 1e-6), name, at: carried + carry(t) });
      }
      carried += carry(long);
    }
    // (each scene kept in the pane: its travel centred)
    for (let i = start; i < beats.length; i++) beats[i].at -= carried / 2;
  }
  const PANE = 760;
  const TOP = 30;
  const PH = 600;
  const K = 3;
  const cvs = document.createElement('canvas');
  cvs.width = PANE * 2;
  cvs.height = TOP + PH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const B = beats[i];
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cvs.width, cvs.height);
    label(g, `The Quill: ${B.name || 'stand'}  (one and a half times the game's size)`, 8, 6);
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = k * PANE;
      g.save();
      g.beginPath();
      g.rect(ox + 2, TOP, PANE - 4, PH - 2);
      g.clip();
      g.translate(ox, TOP);
      floor(g, PANE, PH);
      g.translate(-ox, -TOP);
      const [dx, dy] = srForward(view);
      const fx = ox + PANE / 2 + dx * B.at * (K / 2);
      const fy = TOP + 430 + dy * B.at * (K / 2);
      g.fillStyle = 'rgba(20, 18, 30, 0.35)';
      g.beginPath();
      g.ellipse(fx, fy, 60, 24, 0, 0, Math.PI * 2);
      g.fill();
      const sp = toSprite(quillPainted(B.mv, B.t, view), null, QL_CANVAS.ax, QL_CANVAS.ay);
      g.drawImage(sp.img, Math.round(fx - sp.ax * K), Math.round(fy - sp.ay * K), sp.w * K, sp.h * K);
      g.restore();
      label(g, view === 'front' ? 'from in front' : 'from behind', ox + 10, TOP + PH - 26);
    });
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

/**
 * THE PAIR ON THE FLOOR (`film:floor`): every attack of both with what it does to the floor, as big as it is, the knight
 * standing by for its size, the tiles drawn faintly: from in front, one and a half times the game's size. Then the
 * Overwrite (the Quill flies to the Scraper and writes on it, and is struck) and the combo, the Palimpsest.
 */
function filmFloor(): void {
  const S = 1.5;
  const W = 1280;
  const H = 720;
  const TOP = 34;
  const PWp = Math.ceil(W / S);
  const PHp = Math.ceil((H - TOP) / S);
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const pic = document.createElement('canvas');
  pic.width = PWp;
  pic.height = PHp;
  const P2 = pic.getContext('2d') as CanvasRenderingContext2D;
  P2.imageSmoothingEnabled = false;
  const gameC = document.createElement('canvas');
  gameC.width = Math.ceil(PWp / 2);
  gameC.height = Math.ceil(PHp / 2);
  const o = gameC.getContext('2d') as CanvasRenderingContext2D;
  o.imageSmoothingEnabled = false;
  // (the world: the Scraper's floor point at the scene's origin, (10, 10), here on the picture)
  let OX = 0;
  let OY = 0;
  const origin = (px: number, py: number): void => {
    const [a, b] = pictureOf(10, 10);
    OX = a - px;
    OY = b - py;
  };
  const atP = (x: number, y: number): [number, number] => {
    const [a, b] = pictureOf(x, y);
    return [a - OX, b - OY];
  };
  const at = (x: number, y: number): readonly [number, number] => {
    const [a, b] = atP(x, y);
    return [a / 2, b / 2];
  };
  type Fig = { sp: Sprite; x: number; y: number; mirror?: boolean; shadow: number };
  const knight = spriteOf3(MOVES3.rear, 0, 'front');
  const ground = (): void => {
    P2.fillStyle = '#4a4a42';
    P2.fillRect(0, 0, PWp, PHp);
    // (the tiles, faintly: each a diamond, for the sizes)
    P2.strokeStyle = 'rgba(30, 28, 24, 0.35)';
    P2.lineWidth = 1;
    for (let k = -30; k <= 50; k++) {
      const [a0, b0] = atP(k, -20);
      const [a1, b1] = atP(k, 40);
      P2.beginPath();
      P2.moveTo(a0, b0);
      P2.lineTo(a1, b1);
      P2.stroke();
      const [c0, d0] = atP(-20, k);
      const [c1, d1] = atP(40, k);
      P2.beginPath();
      P2.moveTo(c0, d0);
      P2.lineTo(c1, d1);
      P2.stroke();
    }
  };
  const figures = (figs: Fig[]): void => {
    figs.sort((a, b) => a.x + a.y - (b.x + b.y));
    for (const f of figs) {
      const [sx, sy] = atP(f.x, f.y);
      if (f.shadow > 0) {
        P2.fillStyle = 'rgba(14, 10, 24, 0.35)';
        P2.beginPath();
        P2.ellipse(sx, sy, f.shadow, f.shadow * 0.45, 0, 0, Math.PI * 2);
        P2.fill();
      }
      P2.save();
      P2.translate(Math.round(sx), Math.round(sy));
      if (f.mirror) P2.scale(-1, 1);
      P2.drawImage(f.sp.img, -f.sp.ax * 2, -f.sp.ay * 2);
      P2.restore();
    }
  };
  const SX = 10;
  const SY = 10;
  const U = TILE3;
  const cl = (v: number): number => Math.max(0, Math.min(1, v));
  // each scene: its name, how long, and what to draw `t` seconds in
  type Scene = { name: string; long: number; px: number; py: number; draw: (t: number) => { under: () => void; figs: Fig[] } };
  const SRS = 70;
  const QLS = 30;
  const srAt = (mv: string, t: number, x = SX, y = SY, view: 'front' | 'back' = 'front', mirror = false): Fig => ({ sp: scraperFrame(mv, t, view), x, y, mirror, shadow: SRS });
  const qlAt = (mv: string, t: number, x: number, y: number, view: 'front' | 'back' = 'front', mirror = false): Fig => ({ sp: quillFrame(mv, t, view), x, y, mirror, shadow: QLS });
  const knightAt = (x: number, y: number): Fig => ({ sp: knight, x, y, shadow: 14 });
  const PRE = 0.4;
  const scenes: Scene[] = [
    {
      name: 'The Scraper: claw snap',
      long: PRE + SR_SNAP.long + SNAP_FOR,
      px: 260,
      py: 200,
      draw: (T) => {
        const t = T - PRE;
        return {
          under: () => {
            if (t >= SR_SNAP.warn[0] - 0.1 && t < SR_SNAP.hit) drawSnapWarn(o, at, SX, SY, 1, 0, cl((t - SR_SNAP.warn[0] + 0.1) / (SR_SNAP.hit - SR_SNAP.warn[0] + 0.1)));
            if (t >= SR_SNAP.hit) drawSnap(o, at, SX, SY, 1, 0, t - SR_SNAP.hit);
          },
          figs: [t < 0 || t >= SR_SNAP.long ? srAt('stand', Math.max(0, t)) : srAt('attack', t), knightAt(SX + 3.6, SY - 1.4)],
        };
      },
    },
    {
      name: 'The Scraper: the scour',
      long: PRE + SR_SCOUR.long + 0.6,
      px: 260,
      py: 200,
      draw: (T) => {
        const t = T - PRE;
        return {
          under: () => {
            if (t >= SR_SCOUR.warn[0] - 0.2 && t < SR_SCOUR.slam) drawScourWarn(o, at, SX, SY, 1, 0, cl((t - SR_SCOUR.warn[0] + 0.2) / (SR_SCOUR.slam - SR_SCOUR.warn[0] + 0.2)));
            if (t >= SR_SCOUR.slam) drawScour(o, at, SX, SY, 1, 0, t - SR_SCOUR.slam);
          },
          figs: [t < 0 || t >= SR_SCOUR.long ? srAt('stand', Math.max(0, t)) : srAt('scour', t), knightAt(SX + 2.2, SY - 2.4)],
        };
      },
    },
    {
      name: 'The Scraper: the backward rush',
      long: PRE + SR_RUSH.long + 0.8,
      px: 520,
      py: 330,
      draw: (T) => {
        const t = T - PRE;
        const back = RUSH_TILES * cl((t - SR_RUSH.go) / (SR_RUSH.stop - SR_RUSH.go));
        return {
          under: () => {
            if (t >= SR_RUSH.warn[0] - 0.1 && t < SR_RUSH.go) drawRushWarn(o, at, SX, SY, 1, 0, cl((t - SR_RUSH.warn[0] + 0.1) / (SR_RUSH.go - SR_RUSH.warn[0] + 0.1)));
            if (t >= SR_RUSH.go && t < SR_RUSH.go + RUSH_WAKE_FOR + 0.5) drawRushWake(o, at, SX, SY, 1, 0, t - SR_RUSH.go, back);
          },
          figs: [t < 0 || t >= SR_RUSH.long ? srAt('stand', Math.max(0, t), SX - back) : srAt('rush', t, SX - back), knightAt(SX - 4.2, SY + 0.6)],
        };
      },
    },
    {
      name: 'The Quill: the nib stab',
      long: PRE + QL_STAB.long + STAB_FOR,
      px: 300,
      py: 240,
      draw: (T) => {
        const t = T - PRE;
        return {
          under: () => {
            if (t >= QL_STAB.warn[0] - 0.1 && t < QL_STAB.hit) drawStabWarn(o, at, SX, SY, 1, 0, STAB_AT, cl((t - QL_STAB.warn[0] + 0.1) / (QL_STAB.hit - QL_STAB.warn[0] + 0.1)));
            if (t >= QL_STAB.hit) drawStab(o, at, SX, SY, 1, 0, STAB_AT, t - QL_STAB.hit);
          },
          figs: [t < 0 || t >= QL_STAB.long ? qlAt('stand', Math.max(0, t), SX, SY) : qlAt('attack', t, SX, SY), knightAt(SX + 2.6, SY + 0.6)],
        };
      },
    },
    {
      name: 'The Quill: ink lines',
      long: PRE + QL_LINES.long + 1.2,
      px: 260,
      py: 220,
      draw: (T) => {
        const t = T - PRE;
        return {
          under: () => {
            QL_LINES.strokes.forEach(([a], i) => {
              if (t >= a) drawInkLine(o, at, SX, SY, 1, 0, i, t - a);
            });
          },
          figs: [t < 0 || t >= QL_LINES.long ? qlAt('stand', Math.max(0, t), SX, SY) : qlAt('lines', t, SX, SY), knightAt(SX + LINES_AT[1] + 0.5, SY - 0.8)],
        };
      },
    },
  ];
  // OVERWRITE: the Quill, off behind the Scraper, takes off, flies to it, lands beside it facing it (toward the eye), writes;
  // struck, it stops
  {
    const QX = SX;
    const QY1 = SY - WRITE_AT.ahead;
    const QY0 = QY1 - 4.5;
    const tFly = QL_TAKEOFF.long;
    const flyFor = (QY1 - QY0) / QL_FLY_PACE;
    const tLand = tFly + flyFor;
    const tWrite = tLand + QL_LAND.long;
    const writeFor = 2.4;
    const tHit = tWrite + writeFor;
    scenes.push({
      name: 'The Quill: overwrite (it flies to the Scraper and writes over its wounds; struck, it stops)',
      long: PRE + tHit + QL_REEL.long + 0.6,
      px: 400,
      py: 300,
      draw: (T) => {
        const t = T - PRE;
        let q: Fig;
        if (t < 0) q = qlAt('stand', 0, QX, QY0, 'front', true);
        else if (t < tFly) q = qlAt('takeoff', t, QX, QY0, 'front', true);
        else if (t < tLand) q = qlAt('fly', t - tFly, QX, QY0 + QL_FLY_PACE * (t - tFly), 'front', true);
        else if (t < tWrite) q = qlAt('land', t - tLand, QX, QY1, 'front', true);
        else if (t < tHit) q = qlAt('write', t - tWrite, QX, QY1, 'front', true);
        else if (t < tHit + QL_REEL.long) q = qlAt('reel', t - tHit, QX, QY1, 'front', true);
        else q = qlAt('stand', t - tHit - QL_REEL.long, QX, QY1, 'front', true);
        const sr = srAt('stand', Math.max(0, t));
        return {
          under: () => {},
          figs: [sr, q],
          over: t >= tWrite && t < tHit ? (): void => {
            const [a, b] = atP(SX, SY);
            drawOverwriting(P2, a, b - SR_BODY_Z * 1.1 - 6, t - tWrite);
          } : undefined,
        } as { under: () => void; figs: Fig[] };
      },
    });
  }
  // THE PALIMPSEST: the Scraper scrapes its strip; the Quill, beyond the strip's far end facing back down it, swoops down it
  // writing and lands short of the Scraper; the strip bursts along it as it was written
  {
    const QEND = SX + 3.4;
    const QX0 = QEND + SWOOP_TILES;
    const q0 = SR_STRIP.run[1] + 0.1 - QL_SWOOP.go;
    const tStop = q0 + QL_SWOOP.stop;
    const tBurst = tStop + STRIP_BURST_AFTER;
    scenes.push({
      name: 'The Palimpsest: the Scraper scours a strip, the Quill swoops down it writing, and it bursts',
      long: PRE + Math.max(SR_STRIP.long, q0 + QL_SWOOP.long, tBurst + 1.6),
      px: 150,
      py: 160,
      draw: (T) => {
        const t = T - PRE;
        const tq = t - q0;
        const carried = SWOOP_TILES * cl((tq - QL_SWOOP.go) / (QL_SWOOP.stop - QL_SWOOP.go));
        // (how far down the strip its nib has written: from the far end, while its nib is down)
        const nibX = QX0 - carried - SWOOP_NIB - SX;
        const written = tq >= QL_SWOOP.go + 0.08 ? cl((STRIP_FROM + STRIP_TILES - Math.max(STRIP_FROM, nibX)) / STRIP_TILES) : 0;
        let q: Fig;
        if (tq < 0) q = qlAt('stand', Math.max(0, t), QX0, SY, 'back', true);
        else if (tq < QL_SWOOP.long) q = qlAt('swoop', tq, QX0 - carried, SY, 'back', true);
        else q = qlAt('stand', tq - QL_SWOOP.long, QEND, SY, 'back', true);
        return {
          under: () => {
            if (t >= SR_STRIP.warn[0] - 0.1 && t < SR_STRIP.slam) drawStripWarn(o, at, SX, SY, 1, 0, cl((t - SR_STRIP.warn[0] + 0.1) / (SR_STRIP.slam - SR_STRIP.warn[0] + 0.1)));
            if (t >= SR_STRIP.slam && t < tBurst + 0.05) drawStrip(o, at, SX, SY, 1, 0, t - SR_STRIP.slam, written);
            if (t >= tBurst) drawStripBurst(o, at, SX, SY, 1, 0, t - tBurst);
          },
          figs: [t < 0 || t >= SR_STRIP.long ? srAt('stand', Math.max(0, t)) : srAt('strip', t), q, knightAt(SX + STRIP_FROM + 4.2, SY + 0.4)],
        };
      },
    });
  }
  const fps = 30;
  const beats: { s: number; t: number }[] = [];
  scenes.forEach((sc, s) => {
    const n = Math.round(sc.long * fps);
    for (let i = 0; i < n; i++) beats.push({ s, t: i / fps });
  });
  const draw = (i: number): void => {
    const B = beats[i];
    const sc = scenes[B.s];
    origin(sc.px, sc.py);
    ground();
    o.clearRect(0, 0, gameC.width, gameC.height);
    const r = sc.draw(B.t) as { under: () => void; figs: Fig[]; over?: () => void };
    r.under();
    P2.drawImage(gameC, 0, 0, gameC.width * 2, gameC.height * 2);
    figures(r.figs);
    r.over?.();
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, W, H);
    g.drawImage(pic, 0, TOP, PWp * S, PHp * S);
    label(g, `${sc.name}  (one and a half times the game's size; the knight for scale)`, 8, 8);
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
void QL_BODY_Z;

/** POSES, for checking: `poses:quill:attack@0.3,lines@1.1,...` (or `scraper`), each from in front and from behind, three times the picture's size. */
function poses(): void {
  const [, who, list] = HASH.split(':');
  const items = (list ?? '').split(',').filter(Boolean).map((s) => {
    const [mv, t] = s.split('@');
    return [mv, Number(t ?? 0)] as const;
  });
  const CW = 300;
  const CH = 300;
  const K = 2;
  const cvs = document.createElement('canvas');
  cvs.width = CW * 2 * Math.min(3, items.length);
  cvs.height = CH * Math.ceil(items.length / 3);
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  floor(g, cvs.width, cvs.height);
  items.forEach(([mv, t], i) => {
    (['front', 'back'] as const).forEach((view, k) => {
      const ox = ((i % 3) * 2 + k) * CW;
      const oy = Math.floor(i / 3) * CH;
      const painted = who === 'quill' ? quillPainted(mv, t, view) : scraperPainted(mv, t, view);
      const C = who === 'quill' ? QL_CANVAS : SR_CANVAS;
      const sp = toSprite(painted, null, C.ax, C.ay);
      g.save();
      g.beginPath();
      g.rect(ox, oy, CW - 2, CH - 2);
      g.clip();
      g.drawImage(sp.img, Math.round(ox + CW / 2 - sp.ax * K), Math.round(oy + CH * 0.72 - sp.ay * K), sp.w * K, sp.h * K);
      g.restore();
      label(g, `${mv} ${t}`, ox + 4, oy + 4);
    });
  });
  document.body.style.margin = '0';
  document.body.appendChild(cvs);
  win.__ready = true;
}

if (HASH.startsWith('poses')) poses();
else if (HASH.startsWith('look')) look();
else if (HASH === 'film:quill') filmQuill();
else if (HASH === 'film:floor') filmFloor();
else if (HASH.startsWith('film')) film(HASH.split(':')[1] ?? 'scraper');
