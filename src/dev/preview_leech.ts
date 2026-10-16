// THE BOG LEECHES, floor 10's tiny mob, as mock-ups for the owner (art/bog_leech.ts, behind LEECH_ON, off).
// Hashes: `look` (them standing beside the knight, the Drowned and a rubbling, at the game's size, a pack of them,
// and close up); `standfilm` (their stand, moving, three times the game's size); `seq:slither` (it slithers across
// the mud, carried at its pace) and `seq:attack` (its leap and latch on the knight, struck, its burst), three times the
// game's size, from in front and behind.

import { BL_ATTACK, BL_DIE, BL_IDLE, BL_LATCH, BL_PACE, BL_REEL, BL_STAND, leechFrame } from '../art/bog_leech';
import { DROWNED } from '../art/drowned';
import { rubblingFrame } from '../art/floor6_mobs';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { canvasOf, paintMob } from '../art/new_mobs3';
import { toSprite } from '../art/kit';
import { P } from '../art/palette';
import { ENEMY_RIM } from '../art/mkit';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, drawAt } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'look';

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, text, Math.round(x / 2), Math.round(y / 2), THEME.text, { shadow: P.ink });
  g.restore();
}
/** The fen's mud, as a floor: dark peat, a few puddles. */
function mud(g: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number): void {
  g.fillStyle = '#2b2a22';
  g.fillRect(ox, oy, w, h);
  g.fillStyle = '#34332a';
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 0 : 64; x < w; x += 128) g.fillRect(ox + x, oy + y, Math.min(64, w - x), Math.min(32, h - y));
  g.fillStyle = '#1d2a28';
  for (let i = 0; i < 9; i++) {
    const x = ((i * 337) % w) + ox;
    const y = ((i * 211) % h) + oy;
    g.beginPath();
    g.ellipse(x, y, 30 + (i % 3) * 12, 9 + (i % 2) * 4, 0, 0, Math.PI * 2);
    g.fill();
  }
}
function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number): void {
  g.fillStyle = 'rgba(10, 8, 16, 0.35)';
  g.beginPath();
  g.ellipse(x, y, rx, rx * 0.4, 0, 0, Math.PI * 2);
  g.fill();
}
function drawBig(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.drawImage(sp.img, Math.round(x - sp.ax * 2 * k), Math.round(y - sp.ay * 2 * k), sp.w * 2 * k, sp.h * 2 * k);
}
function done(cvs: HTMLCanvasElement): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}
function drowned(t: number): Sprite {
  const can = canvasOf(DROWNED);
  return toSprite(paintMob(DROWNED, 'stand', t, 'front', ENEMY_RIM), null, can.ax, can.ay);
}

function look(): void {
  const H = 700;
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  mud(g, 0, 0, PW, H);
  const FOOT = 210;
  const put = (sp: Sprite, x: number, rx: number, name: string, y = FOOT): void => {
    shadow(g, x, y, rx);
    drawAt(g, sp, x, y);
    if (name) label(g, name, x - name.length * 5, y + 18);
  };
  label(g, 'The Bog Leeches (this row at the game\'s size)', 8, 6);
  put(spriteOf3(MOVES3.rear, 0, 'front'), 60, 14, 'knight');
  put(drowned(0.3), 170, 18, 'drowned');
  put(rubblingFrame('stand', 0.2, 'front'), 280, 12, 'rubbling');
  put(leechFrame('stand', 0.2, 'front'), 400, 14, 'leech');
  put(leechFrame('stand', 0.6, 'back'), 520, 14, 'behind');
  put(leechFrame('stand', 1.12, 'front'), 640, 14, 'its mouth');
  // (a pack of seven, as they come)
  label(g, 'a pack', 820, 6);
  const pack: [number, number, number, 'front' | 'back'][] = [[760, 120, 0.1, 'front'], [850, 100, 0.7, 'front'], [930, 140, 1.2, 'back'], [800, 175, 0.4, 'front'], [890, 200, 1.0, 'front'], [960, 230, 0.25, 'back'], [770, 240, 1.45, 'front']];
  for (const [x, y, t, v] of pack) put(leechFrame('stand', t, v), x, 12, '', y);
  label(g, 'three times the game\'s size', 8, 290);
  const BIG = 640;
  drawBig(g, leechFrame('stand', 0.2, 'front'), 200, BIG, 3);
  drawBig(g, leechFrame('stand', 0.6, 'back'), 530, BIG, 3);
  drawBig(g, leechFrame('stand', 1.12, 'front'), 840, BIG, 3);
  label(g, 'its mouth of teeth', 760, BIG + 20);
  done(cvs);
}

/** ITS STAND, moving, three times the game's size, from in front and behind (hash `standfilm`). */
function standFilm(): void {
  const fps = BL_IDLE.fps;
  const n = Math.round(BL_STAND * fps);
  const W = PW;
  const H = 360;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const draw = (i: number): void => {
    const t = i / fps;
    mud(g, 0, 0, W, H);
    for (const [x, view, k] of [[230, 'front', 0], [520, 'back', 0], [800, 'front', 0.8]] as [number, 'front' | 'back', number][]) {
      shadow(g, x, 300, 46);
      drawBig(g, leechFrame('stand', t + k, view), x, 300, 3);
    }
    label(g, 'A bog leech, standing (three times the game\'s size)', 8, 6);
    label(g, `${t.toFixed(1)} s`, 8, H - 28);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = n;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}


/** A sprite three times the game's size, turned to face the other way. */
function drawBigFlip(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, k: number): void {
  g.save();
  g.translate(Math.round(x), 0);
  g.scale(-1, 1);
  g.drawImage(sp.img, Math.round(-sp.ax * 2 * k), Math.round(y - sp.ay * 2 * k), sp.w * 2 * k, sp.h * 2 * k);
  g.restore();
}
/**
 * ITS MOVES AS THE GAME WOULD PLAY THEM, one after another (hash `seq:<name>`), three times the game's size, from in
 * front (left) and behind (right): `slither`, standing, slithering 1.6 s carried across at its pace, standing;
 * `attack`, its leap and latch on the knight, standing where it clamps on and facing it (from in front he stands
 * before it and would hide it, so there he is drawn faint), struck, its burst, and what is left a while after.
 */
function seqFilm(): void {
  const which = HASH.split(':')[1];
  const parts: [string, number][] = which === 'slither' ? [['stand', 0.4], ['walk', 1.6], ['stand', 0.5]] : [['stand', 0.4], ['attack', BL_ATTACK], ['stand', 0.3], ['reel', BL_REEL], ['stand', 0.4], ['dying', BL_DIE], ['dead', 0.6]];
  const fps = 15;
  const list: [string, number, number][] = [];
  let T = 0;
  for (const [mv, long] of parts) {
    const n = Math.round(long * fps);
    for (let i = 0; i < n; i++) list.push([mv, i / fps, T + i / fps]);
    T += long;
  }
  const W = PW;
  const H = 420;
  const k = 3;
  const cvs = document.createElement('canvas');
  cvs.width = W;
  cvs.height = H;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const walkStart = parts[0][1];
  // (one of the figure's lengths on the floor, as the screen shows it at three times: forward is 0.82 across and 0.41 down (in front) or up (behind) a picture pixel)
  const P3 = 0.8165 * k;
  const draw = (i: number): void => {
    const [mv, t, at] = list[Math.min(i, list.length - 1)];
    mud(g, 0, 0, W, H);
    for (const [x0, y0, view] of [[180, 330, 'front'], [600, 330, 'back']] as [number, number, 'front' | 'back'][]) {
      const dn = view === 'front' ? 0.5 : -0.5;
      // (slithering, it is carried on at its pace)
      const went = which === 'slither' ? Math.max(0, Math.min(at, walkStart + 1.6) - walkStart) * BL_PACE * 39.19 : 0;
      const x = x0 + went * P3;
      const y = y0 + went * P3 * dn;
      const knightAt: [number, number] = [x0 + (BL_LATCH[0] + 7) * P3, y0 + (BL_LATCH[0] + 7) * P3 * dn];
      const knight = (): void => {
        shadow(g, knightAt[0], knightAt[1], 40);
        drawBigFlip(g, spriteOf3(MOVES3.rear, 0, view === 'front' ? 'back' : 'front'), knightAt[0], knightAt[1], k);
      };
      // (the knight behind it, where it is seen from behind; in front of it he would hide it, so there he is drawn faint, over it)
      if (which === 'attack' && view === 'back') knight();
      if (mv !== 'dying' && mv !== 'dead') shadow(g, x, y, 40);
      const sp = mv === 'dead' ? leechFrame('dying', BL_DIE, view) : leechFrame(mv, t, view);
      drawBig(g, sp, x, y, k);
      if (which === 'attack' && view === 'front') {
        g.globalAlpha = 0.3;
        knight();
        g.globalAlpha = 1;
      }
    }
    if (which === 'attack') label(g, 'in front: the knight drawn faint', 8, H - 56);
    const say: Record<string, string> = { walk: 'it slithers', attack: t < 0.5 ? 'it rears and quivers, its mouth flared (the warning)' : t < 0.64 ? 'IT LEAPS' : t < 1.25 ? 'clamped on, drinking, swelling' : t < 1.4 ? 'it drops off, fat' : 'and wriggles back', reel: 'struck', dying: 'it bursts', dead: '', stand: '' };
    label(g, 'A bog leech (three times the game\'s size)', 8, 6);
    if (say[mv]) label(g, say[mv], W - say[mv].length * 12 - 16, 34);
    label(g, `${at.toFixed(2)} s`, 8, H - 28);
  };
  draw(0);
  done(cvs);
  const win = window as unknown as { __frames: number; __tickMs: number; __frame: (i: number) => string };
  win.__frames = list.length;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cvs.toDataURL('image/png');
  };
}

if (HASH.startsWith('look')) look();
else if (HASH.startsWith('seq:')) seqFilm();
else if (HASH === 'standfilm') standFilm();
