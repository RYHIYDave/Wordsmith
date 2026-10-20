// Dev page: FLOOR 13'S DOUBLE BOSS, THE SCRAPER AND THE QUILL (art/scraper.ts, art/quill.ts), for the owner to look at. Nothing
// of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_pair.ts shots/pair_look.png 1014 820 look
//     the two standing, from in front and from behind, the knight beside them at the game's size; close-ups of each

import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { RUSH_TILES, SR_CANVAS, SR_DIE, SR_REEL, SR_RUSH, SR_SCOUR, SR_SNAP, SR_STAND, SR_STRIP, SR_WALK, scraperFrame, scraperPainted, srForward } from '../art/scraper';
import { toSprite } from '../art/kit';
import { TILE3 } from '../art/new_mobs3';
import { quillFrame } from '../art/quill';
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

if (HASH.startsWith('look')) look();
else if (HASH.startsWith('film')) film(HASH.split(':')[1] ?? 'scraper');
