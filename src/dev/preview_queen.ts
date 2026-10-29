// Dev page: FLOOR 18'S BOSS, THE QUEEN (art/queen.ts, art/queen_moves.ts, art/queen_fx.ts), standing, from in front and
// from behind, beside the knight for size, three times as big; at the game's size with her mirror; a move close up; and
// the film of all her moves in the Mirror Hall. Nothing of the game imports it.
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_queen.ts shots/queen/sheet.png 1200 760 "sheet"
//   ... "big:<move>:<t>" (front and behind, four times as big), "grid:<move>:<t>,<t>,..." (a move at several moments)
//   node tools/queen_film.mjs (the film: this page's "film" mode, frame by frame)
// THE FLOOR UNDER HER here is a stand-in (dark polished stone): floor 18's own ground is another helper's.
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import type { Painted } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import { QUEEN } from '../art/queen_moves';
import type { GameView } from '../art/skin';
import { Hall, filmScript } from './queen_film';
import { TALK_CANVAS, talkingMirrorPainted } from '../art/queen_fx';

const [mode = 'sheet', a1 = 'stand', a2 = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;

/** A stand-in floor of dark polished stone (game pixels), its diamonds 32 by 16, a seam of pale grey between them, a sheen across. */
export function stoneFloor(w: number, h: number, ox = 0, oy = 0): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d') as CanvasRenderingContext2D;
  const img = x.createImageData(w, h);
  const A = [24, 21, 34];
  const Bc = [30, 27, 42];
  const S = [52, 49, 66];
  for (let y = 0; y < h; y++) {
    for (let xx = 0; xx < w; xx++) {
      const gx = xx + ox;
      const gy = y + oy;
      // (which diamond: along the grid)
      const u = (gx / 32 + gy / 16) / 1;
      const v = (gx / 32 - gy / 16) / 1;
      const iu = Math.floor(u);
      const iv = Math.floor(v);
      const fu = u - iu;
      const fv = v - iv;
      const seam = fu < 0.035 || fv < 0.035;
      const base = (iu + iv) % 2 === 0 ? A : Bc;
      const vein = Math.sin(gx * 0.11 + Math.sin(gy * 0.07) * 3 + iu * 1.7) > 0.96 ? 6 : 0;
      const sheen = ((gx * 0.5 + gy + 4000) % 90) < 4 ? 5 : 0;
      const col = seam ? S : base;
      const i = (y * w + xx) * 4;
      img.data[i] = col[0] + vein + sheen;
      img.data[i + 1] = col[1] + vein + sheen;
      img.data[i + 2] = col[2] + vein + sheen + 2;
      img.data[i + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}
/** A sprite laid down at (x, y) of the page, `k` page pixels to a picture pixel. */
function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const spOf = (which: string, t: number, view: GameView): Sprite => {
  const can = canvasOf(QUEEN);
  const p: Painted = which === 'dying' ? deathOfMob(QUEEN, t / QUEEN.dieTime, view) : paintMob(QUEEN, which, t, view);
  return toSprite(p, which === 'dying' ? null : QUEEN.aura, can.ax, can.ay);
};
const hero = makeHeroArt3().of('warrior', { twoHanded: false });
const label = (s: string, x: number, y: number, size = 18, color = '#d8d0e8', align: CanvasTextAlign = 'center'): void => {
  g.font = `${size}px DejaVu Sans, sans-serif`;
  g.textAlign = align;
  g.fillStyle = '#07050a';
  g.fillText(s, x + 1, y + 1);
  g.fillStyle = color;
  g.fillText(s, x, y);
};
const floor = (k: number): void => {
  const F = stoneFloor(Math.ceil(cv.width / k), Math.ceil(cv.height / k), 7, 3);
  g.drawImage(F, 0, 0, F.width * k, F.height * k);
};

if (mode === 'sheet') {
  // THE SHEET: the Queen from in front and from behind beside the knight, three times as big; below, at the game's size
  // (as the Princess's sheet had it), beside the knight, with her mirror that talks
  floor(6);
  const K = 3;
  const y = 340;
  draw(hero.front.idle[0], 120, y, K);
  draw(spOf('stand', 0, 'front'), 400, y, K);
  draw(spOf('stand', 0, 'back'), 720, y, K);
  draw(hero.back.idle[0], 990, y, K);
  label('the knight', 120, y + 34);
  label('the Queen, in front', 400, y + 34);
  label('the Queen, behind', 720, y + 34);
  label('the knight, behind', 990, y + 34);
  g.fillStyle = 'rgba(7,5,10,0.55)';
  g.fillRect(0, y + 52, cv.width, 3);
  const y2 = cv.height - 56;
  label('at the game\'s size', 24, y + 86, 20, '#bfb6e6', 'left');
  draw(hero.front.idle[0], 150, y2, 2);
  draw(spOf('stand', 0, 'front'), 300, y2, 2);
  draw(spOf('stand', 0, 'back'), 450, y2, 2);
  label('the knight and the Queen', 300, y2 + 34);
  const talk = toSprite(talkingMirrorPainted('speaking', 1.2), null, TALK_CANVAS.ax, TALK_CANVAS.ay);
  draw(talk, 700, y2, 2);
  label('her mirror, speaking', 700, y2 + 34);
  const truth = toSprite(talkingMirrorPainted('truth', 3.4), null, TALK_CANVAS.ax, TALK_CANVAS.ay);
  draw(truth, 1000, y2, 2);
  label('as she dies: the truth', 1000, y2 + 34);
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS (`grid:<move>:<t>,<t>,...`), twice as big: from in front along the top, from behind below
  floor(4);
  const K = 2;
  const ts = a2.split(',').map(Number);
  const w = cv.width / ts.length;
  ts.forEach((t, i) => {
    for (const [row, view] of [[0, 'front'], [1, 'back']] as const) {
      const y = (cv.height / 2) * (row + 1) - 30;
      draw(spOf(a1, t, view), w * (i + 0.42), y, K);
      label(`${t.toFixed(3)} s`, w * i + 6, y + 22, 14, '#ffffff', 'left');
    }
  });
} else if (mode === 'big') {
  floor(8);
  const K = 4;
  const t = Number(a2) || 0;
  draw(spOf(a1, t, 'front'), cv.width * 0.3, cv.height - 70, K);
  draw(spOf(a1, t, 'back'), cv.width * 0.72, cv.height - 70, K);
} else if (mode === 'film' || mode === 'frame') {
  // THE FILM (`film`: frame by frame for tools/queen_film.mjs; `frame:<k>[,<k>...]`: frames of it side by side, to look at)
  const script = filmScript();
  const win = window as unknown as { __frames: number; __frame: (i: number) => string; __said: (i: number) => string };
  if (mode === 'film') {
    const hall = new Hall(cv, hero);
    win.__frames = script.length;
    win.__said = (i: number): string => `${script[i].title} | ${script[i].tag}`;
    win.__frame = (i: number): string => {
      hall.draw(script[i]);
      return cv.toDataURL('image/png');
    };
  } else {
    const ks = a1.split(',').map(Number);
    const one = document.createElement('canvas');
    one.width = 1080;
    one.height = 1080;
    const hall = new Hall(one, hero);
    const per = Math.ceil(Math.sqrt(ks.length));
    const w = cv.width / per;
    ks.forEach((k, i) => {
      hall.draw(script[Math.min(script.length - 1, k)]);
      g.drawImage(one, (i % per) * w, Math.floor(i / per) * w, w, w);
    });
    label(`${script.length} frames`, 8, 20, 16, '#ffffff', 'left');
  }
}
(window as unknown as { __ready: boolean }).__ready = true;
