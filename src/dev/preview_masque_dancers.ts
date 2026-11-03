// Dev page: FLOOR 17'S MASKED DANCERS (art/masque_dancers.ts, art/masque_dancers_moves.ts; behind DANCERS_ON, off), standing,
// from in front and from behind, beside the knight for size; a move close up; a pair. Nothing of the game imports it. (The
// owner's pictures and film are painted by tools/masque_dancers_film.ts.)
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_masque_dancers.ts shots/dancers/sheet.png 1200 600 "sheet"
//   ... "big:<lady|gent>:<move>:<t>[:<room>]" (front and behind, four times as big)
//   ... "pair:<waltz|chime>:<t>" (a lady and a gentleman as one picture, front and behind, four times as big)
import type { Sprite } from '../engine/px';
import { makeHeroArt3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { canvasOf, deathOfMob, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import { DANCERS, DANCER_GENT, DANCER_LADY, pairPainted } from '../art/masque_dancers_moves';
import type { RoomName } from '../art/masque_dancers';
import type { GameView } from '../art/skin';

const [mode = 'sheet', a1 = 'lady', a2 = 'stand', a3 = '0', a4 = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
/** A floor of polished squares (a stand-in: the Masque's own is not drawn yet), `k` screen pixels to a picture pixel. */
function floor(k: number): void {
  g.fillStyle = '#1b2136';
  g.fillRect(0, 0, cv.width, cv.height);
  g.strokeStyle = '#2c3654';
  const w = 32 * k;
  for (let i = -40; i < 40; i++) {
    g.beginPath();
    g.moveTo(i * w, 0);
    g.lineTo(i * w + cv.height * 2, cv.height);
    g.moveTo(i * w, cv.height);
    g.lineTo(i * w + cv.height * 2, 0);
    g.stroke();
  }
}
function draw(s: Sprite, x: number, y: number, k: number): void {
  const d = s.density ?? 1;
  g.drawImage(s.img, Math.round(x - s.ax * d * k), Math.round(y - s.ay * d * k), s.w * d * k, s.h * d * k);
}
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'dying' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

if (mode === 'sheet') {
  const K = 3;
  floor(K);
  const y = cv.height - 40;
  draw(hero.front.idle[0], 95, y, K);
  draw(spOf(DANCER_LADY, 'stand', 0, 'front'), 265, y, K);
  draw(spOf(DANCER_LADY, 'stand', 0, 'back'), 445, y, K);
  draw(spOf(DANCER_GENT, 'stand', 0, 'front'), 640, y, K);
  draw(spOf(DANCER_GENT, 'stand', 0, 'back'), 830, y, K);
  draw(hero.back.idle[0], 1040, y, K);
} else if (mode === 'big') {
  const K = 4;
  floor(K);
  const mob = a4 ? DANCERS[a1 === 'gent' ? 'gent' : 'lady'][a4 as RoomName] : a1 === 'gent' ? DANCER_GENT : DANCER_LADY;
  const t = Number(a3) || 0;
  draw(spOf(mob, a2, t, 'front'), cv.width * 0.3, cv.height - 60, K);
  draw(spOf(mob, a2, t, 'back'), cv.width * 0.72, cv.height - 60, K);
} else if (mode === 'pair') {
  const K = 4;
  floor(K);
  const move = a1 === 'chime' ? 'chime' : 'waltz';
  const t = Number(a2) || 0;
  const can = canvasOf(DANCER_GENT);
  for (const [view, x] of [['front', 0.3], ['back', 0.72]] as const) draw(toSprite(pairPainted(DANCER_LADY, DANCER_GENT, move, t, view), null, can.ax, can.ay), cv.width * x, cv.height - 60, K);
}
(window as unknown as { __ready: boolean }).__ready = true;
