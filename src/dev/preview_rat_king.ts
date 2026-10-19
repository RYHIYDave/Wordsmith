// Dev page: THE RAT KING (art/rat_king.ts), floor 12's boss, on the King's Cistern's flags (art/undercity.ts), beside
// the knight and a Hushed porter for size. Nothing of the game imports it.

import { UC_ZONE, undercityLook } from '../art/undercity';
import { HUSHED_PORTER } from '../art/hushed_moves';
import { ROLL_PACE, RK_ROLL, RK_STAND, RK_UNKNOT, RK_WALK, RK_WORDS, ratKingFrame, ratKingLong } from '../art/rat_king';
import { WORD_SPEED, drawStolenWord, drawWordAim, drawWordBurst } from '../art/rat_king_shots';
import type { StolenWord } from '../art/rat_king_shots';
import { TILE3 } from '../art/new_mobs3';
import { stage } from '../art/skin';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { MOVES3 } from '../art/moves3';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { P } from '../art/palette';
import { paintTerrain, pictureOf, terrainOf } from '../art/terrain';
import { drawText } from '../engine/font';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { T_FLOOR } from '../game/types';
import type { Floor } from '../game/types';
import type { GameView } from '../art/skin';
import { THEME } from '../ui/ui';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'sheet';


const W = 30;
const H = 30;
const FLOOR = { depth: 12, seed: 12, w: W, h: H, tiles: new Uint8Array(W * H).fill(T_FLOOR), cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: () => UC_ZONE.Cistern, water: () => false };
const T = terrainOf(FLOOR, undercityLook(LAND));

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
function show(): void {
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cv);
  win.__ready = true;
}
/** The ground under a pane, `S` times (a terrain pixel is a picture pixel), its middle on the square's middle. */
function groundPane(x: number, y: number, w: number, h: number, S: number): void {
  const [cx, cy] = pictureOf(15, 15);
  const gw = Math.ceil(w / S);
  const gh = Math.ceil(h / S);
  const p = paintTerrain(T, Math.round(cx - gw / 2), Math.round(cy - gh / 2), gw, gh);
  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  (c.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, gw, gh), 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(c, x, y, gw * S, gh * S);
  g.fillStyle = 'rgba(26,16,40,0.2)';
  g.fillRect(x, y, w, h);
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'die' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');
function figure(sp: Sprite, fx: number, fy: number, S: number, shadow: number): void {
  g.save();
  g.fillStyle = 'rgba(14,10,24,0.45)';
  g.beginPath();
  g.ellipse(fx, fy, shadow * S, shadow * 0.45 * S, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx, fy, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx - sp.ax * 2 * S), Math.round(fy - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx, fy, 2 * S);
}
function label(s: string, x: number, y: number): void {
  g.save();
  g.scale(2, 2);
  drawText(g, s, x / 2, y / 2, THEME.text, { shadow: P.ink });
  g.restore();
}

//   node tools/preview.mjs src/dev/preview_rat_king.ts shots/rk_sheet.png 1700 640 sheet[:<scale>]
//   node tools/preview.mjs src/dev/preview_rat_king.ts shots/rk_game.png 1014 468 game
//   node tools/preview.mjs src/dev/preview_rat_king.ts shots/rk_close.png 1400 900 close:<move>:<seconds>:<scale>
//   node tools/page_gif.mjs src/dev/preview_rat_king.ts "film:<move>[:<scale>]" previews/rat_king/<move>.gif

const HF = (which: string, t: number, view: GameView): Sprite => ratKingFrame(which === 'die' ? 'dying' : which, t, view);
if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  cv.width = 1700;
  cv.height = 640;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cv.width, cv.height);
  const paneY = 40;
  const paneH = 540;
  groundPane(10, paneY, cv.width - 20, paneH, S);
  const fy = paneY + paneH - 70;
  const step = (cv.width - 40) / 5;
  figure(HF('stand', 0, 'front'), 20 + step * 0.75, fy, S, 34);
  figure(HF('stand', 0, 'back'), 20 + step * 2.25, fy, S, 34);
  label('the Rat King, facing you and away', 20 + step * 1.0, paneY + paneH + 12);
  figure(spOf(HUSHED_PORTER, 'stand', 0, 'front'), 20 + step * 3.45, fy, S, HUSHED_PORTER.shadow);
  label('a Hushed porter', 20 + step * 3.45 - 50, paneY + paneH + 12);
  figure(KNIGHT(), 20 + step * 4.3, fy, S, 9);
  label('the knight', 20 + step * 4.3 - 40, paneY + paneH + 12);
  label(`The Rat King, standing (${S} times)`, 14, 10);
  show();
} else if (mode === 'close') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const S = Number(parts[3]) || 6;
  const sps = (['front', 'back'] as const).map((v) => HF(which, t, v));
  const W0 = sps.reduce((a, sp) => a + sp.img.width * S + 30, 10);
  cv.width = W0;
  cv.height = Math.max(...sps.map((sp) => sp.img.height * S)) + 50;
  g.fillStyle = '#3a3448';
  g.fillRect(0, 0, cv.width, cv.height);
  g.imageSmoothingEnabled = false;
  let x = 10;
  for (const sp of sps) {
    g.drawImage(sp.img, x, 40, sp.img.width * S, sp.img.height * S);
    x += sp.img.width * S + 30;
  }
  label(`The Rat King: ${which} at ${t.toFixed(2)} s (${S} times)`, 10, 8);
  show();
} else if (mode === 'game') {
  cv.width = 1014;
  cv.height = 468;
  groundPane(0, 0, cv.width, cv.height, 1);
  const all: [Sprite, number, number, number][] = [
    [HF('stand', 0.2, 'front'), 620, 250, 34],
    [spOf(HUSHED_PORTER, 'stand', 0.7, 'front'), 760, 210, HUSHED_PORTER.shadow],
  ];
  all.push([KNIGHT(), 430, 320, 9]);
  all.sort((a, b) => a[2] - b[2]);
  for (const [sp, x, y, sh] of all) figure(sp, x, y, 1, sh);
  label('The Rat King, at the game\'s size', 10, 8);
  show();
} else if (mode === 'film') {
  // facing you (left) and facing away (right): its stand twice round, its lope, or a move between stands
  const which = parts[1] || 'stand';
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  // (the roll: curled, rolling three turns, uncurled; unknot: gone, a pause, and knotted again)
  const ROLL_T = RK_ROLL.frames / RK_ROLL.fps;
  const SEQ: Record<string, [string, number][]> = {
    roll: [['curl', RK_ROLL.curl], ['roll', ROLL_T], ['uncurl', RK_ROLL.uncurl]],
    unknot: [['unknot', RK_UNKNOT.out], ['gone', 0.5], ['knot', RK_UNKNOT.in]],
  };
  const seq = SEQ[which];
  const LONG = which === 'words' ? 0.5 + RK_WORDS.long + 0.9 : which === 'stand' ? 2 * RK_STAND.period : which === 'walk' ? 8 * RK_WALK.period : seq ? 0.5 + seq.reduce((a, [, l]) => a + l, 0) + 0.6 : 0.5 + (which === 'die' ? ratKingLong('dying') + 0.8 : ratKingLong(which) + 0.6);
  const TICKS = Math.round(LONG * FPS);
  const spAt = (t: number, view: GameView): Sprite => {
    if (which === 'stand') return HF('stand', (Math.floor(t * RK_STAND.fps) % RK_STAND.frames) / RK_STAND.fps, view);
    if (which === 'walk') return HF('walk', (Math.floor(t * RK_WALK.fps) % RK_WALK.frames) / RK_WALK.fps, view);
    const m = t - 0.5;
    if (seq) {
      if (m < 0) return HF('stand', 0, view);
      let at = m;
      for (const [mv, l] of seq) {
        if (at < l) return mv === 'gone' ? HF('unknot', RK_UNKNOT.out, view) : HF(mv, mv === 'roll' ? at % ROLL_T : at, view);
        at -= l;
      }
      return HF('stand', 0, view);
    }
    const long = which === 'die' ? ratKingLong('dying') : ratKingLong(which);
    return m < 0 || (which !== 'die' && m > long) ? HF('stand', 0, view) : HF(which, Math.min(long, m), view);
  };
  const paneW = 260 * S;
  const paneH = 160 * S;
  cv.width = paneW * 2 + 30;
  cv.height = paneH + 56;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = '#0d1030';
    g.fillRect(0, 0, cv.width, cv.height);
    (['front', 'back'] as const).forEach((view, j) => {
      const px = 10 + j * (paneW + 10);
      groundPane(px, 40, paneW, paneH, S);
      // (the roll carries it: as the game would move it, at the pace its ball is painted for, from back along its way)
      let ox = 0;
      let oy = 0;
      if (which === 'roll') {
        const st = stage(view, 0, 0, { w: 2, h: 2 });
        const a = st.at([0, 0, 0]);
        const b = st.at([1, 0, 0]);
        const along = ROLL_PACE * TILE3 * Math.min(ROLL_T, Math.max(0, t - 0.5 - RK_ROLL.curl));
        const half = (ROLL_PACE * TILE3 * ROLL_T) / 2;
        ox = (b[0] - a[0]) * (along - half) * S;
        oy = (b[1] - a[1]) * (along - half) * S;
      }
      g.save();
      g.beginPath();
      g.rect(px, 40, paneW, paneH);
      g.clip();
      const fx = px + paneW * 0.5 + ox;
      const fy = 40 + paneH * 0.66 + oy;
      // (stolen words: its aim on the floor through the warning, then the word flying, then its burst; in game pixels, as the game draws them)
      const word = (parts[3] || 'fire') as StolenWord;
      const W = RK_WORDS;
      const m = t - 0.5;
      const way = view === 'front' ? 1 : -1;
      const AT = (x: number, y: number): readonly [number, number] => [(x - y) * 16 * way, (x + y) * 8 * way];
      const X1 = 3.0;
      g.save();
      g.translate(fx, fy);
      g.scale(2 * S, 2 * S);
      if (which === 'words' && m > W.warn[0] && m < W.hit) drawWordAim(g, AT, 0.8, 0, X1, 0, (m - W.warn[0]) / (W.hit - W.warn[0]), m);
      g.restore();
      figure(spAt(t, view), fx, fy, S, 34);
      if (which === 'words' && m >= W.hit) {
        g.save();
        g.translate(fx, fy);
        g.scale(2 * S, 2 * S);
        const flown = m - W.hit;
        const long = (X1 - 0.8) / WORD_SPEED;
        if (!drawStolenWord(g, AT, word, 0.8, 0, 24, X1, 0, flown)) drawWordBurst(g, AT, word, X1, 0, flown - long);
        g.restore();
      }
      g.restore();
      label(view === 'front' ? 'facing you' : 'facing away', px + paneW / 2 - 40, 40 + paneH + 2);
    });
    label(`The Rat King: ${which}`, 12, 8);
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  show();
}
