// Dev page: FLOOR 20'S BOSS, THE MOTH (art/moth.ts, art/moth_moves.ts, art/moth_fx.ts), on the stand-in tower top
// (dev/moth_top.ts), the knight before it. Nothing of the game imports it. (The owner's pictures and film are made
// without a page: tools/moth_pictures.ts.)
//   PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_moth.ts shots/moth/top.png 1200 1080 "top:stand:0.8:front"
//   ... "top:<move>:<t>:<front|back>" (a moment of a move on the top, what it leaves on the top with it)
//   ... "big:<move>:<t>" (from in front and from behind, side by side, on the dark)
//   ... "grid:<move>:<t>,<t>,...:<front|back>" (a move at several moments, half as big)
import { makeHeroArt3 } from '../art/heroes3';
import type { Painted } from '../art/kit';
import { MOTH_CANVAS } from '../art/moth';
import { MOTH, MOTH_BEAT_BLOW, MOTH_BUFFET, MOTH_DUST, MOTH_EYES, MOTH_SWARM, mothGeomAt } from '../art/moth_moves';
import { CHAPTER_CANVAS, FX_CANVAS, beamsPainted, chapterPainted, cloudPainted, gustPainted, swarmPainted, wavePainted, wordsPainted } from '../art/moth_fx';
import { TILE3, deathOfMob, paintMob, paintViewOf } from '../art/new_mobs3';
import type { V3 } from '../art/skeleton';
import { frameOf, layLight, layPx, layShadow, paintTop, seenAt } from './moth_top';
import type { Frame } from './moth_top';

type View = 'front' | 'back';
const [mode = 'top', a1 = 'stand', a2 = '0.8', a3 = 'front'] = decodeURIComponent(location.hash.slice(1)).split(':');
const cv = document.createElement('canvas');
cv.width = window.innerWidth;
cv.height = window.innerHeight;
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
const T = TILE3;
const hero = makeHeroArt3().of('warrior', { twoHanded: false });

const painted = (move: string, t: number, view: View): Painted => (move === 'dying' ? deathOfMob(MOTH, Math.min(1, t / MOTH.dieTime), view) : paintMob(MOTH, move, t, view));
function effects(move: string, t: number, view: View): { under: Painted[]; over: Painted[] } {
  const pv = paintViewOf(MOTH, view);
  const under: Painted[] = [];
  const over: Painted[] = [];
  if (move === 'attack') under.push(gustPainted(t - MOTH_BUFFET.hit, pv));
  if (move === 'dust') under.push(cloudPainted(t - MOTH_DUST.hit, pv));
  if (move === 'eyes') over.push(beamsPainted(t - MOTH_EYES.hit, pv, mothGeomAt('eyes', MOTH_EYES.hit)));
  if (move === 'swarm') over.push(swarmPainted(t - MOTH_SWARM.hit, pv, mothGeomAt('swarm', MOTH_SWARM.hit).TC));
  if (move === 'beat') under.push(wavePainted(t - MOTH_BEAT_BLOW.hit, pv));
  if (move === 'dying') over.push(wordsPainted(t, pv, (u) => mothGeomAt('dying', u).HC));
  return { under, over };
}
const show = (f: Frame, x: number, y: number): void => g.putImageData(new ImageData(new Uint8ClampedArray(f.d), f.w, f.h), x, y);

if (mode === 'top') {
  // A MOMENT OF A MOVE ON THE TOP: the Moth where it hovers, the knight five and a half tiles before it
  const view = a3 as View;
  const move = a1;
  const t = Number(a2);
  const W = 1200;
  const H = 1080;
  const OX = 600;
  const OY = 800;
  const f = frameOf(W, H);
  paintTop(f, OX, OY);
  const at: V3 = view === 'front' ? [-4.2 * T, 0.6 * T, 0] : [-0.6 * T, -4.2 * T, 0];
  const knight: V3 = view === 'front' ? [1.5 * T, 0.9 * T, 0] : [-0.9 * T, 1.5 * T, 0];
  const [mx, my] = seenAt(at, OX, OY);
  const [kx, ky] = seenAt(knight, OX, OY);
  layShadow(f, mx + 30, my, 170, 0.45);
  layShadow(f, kx, ky, 16, 0.5);
  const fx = effects(move, t, view);
  for (const u of fx.under) layPx(f, u.px, FX_CANVAS.ax, FX_CANVAS.ay, mx, my);
  if (['land', 'perch', 'beat', 'perchReel', 'dying'].includes(move)) layPx(f, chapterPainted(paintViewOf(MOTH, view), 0.3, t).px, CHAPTER_CANVAS.ax, CHAPTER_CANVAS.ay, mx, my);
  layLight(f, mx - MOTH_CANVAS.ax + MOTH.aura.x, my - MOTH_CANVAS.ay + MOTH.aura.y, MOTH.aura.r, MOTH.aura.color, MOTH.aura.a ?? 0.07);
  const p = painted(move, t, view);
  layPx(f, p.px, MOTH_CANVAS.ax, MOTH_CANVAS.ay, mx, my);
  for (const o of fx.over) layPx(f, o.px, FX_CANVAS.ax, FX_CANVAS.ay, mx, my);
  show(f, 0, 0);
  // (the knight, the game's own picture of him, laid over)
  const k = (view === 'front' ? hero.back.idle : hero.front.idle)[0];
  const d = k.density ?? 1;
  g.drawImage(k.img, Math.round(kx - k.ax * d), Math.round(ky - k.ay * d), k.w * d, k.h * d);
} else if (mode === 'big') {
  // FROM IN FRONT AND FROM BEHIND, side by side, on the dark
  const t = Number(a2);
  for (const [i, view] of [[0, 'front'], [1, 'back']] as const) {
    const f = frameOf(MOTH_CANVAS.w, MOTH_CANVAS.h);
    for (let k = 0; k < f.d.length; k += 4) {
      f.d[k] = 22;
      f.d[k + 1] = 21;
      f.d[k + 2] = 26;
      f.d[k + 3] = 255;
    }
    layPx(f, painted(a1, t, view).px, MOTH_CANVAS.ax, MOTH_CANVAS.ay, MOTH_CANVAS.ax, MOTH_CANVAS.ay);
    show(f, i * MOTH_CANVAS.w, 0);
  }
} else if (mode === 'grid') {
  // A MOVE AT SEVERAL MOMENTS, half as big
  const ts = a2.split(',').map(Number);
  const view = a3 as View;
  ts.forEach((t, i) => {
    const p = painted(a1, t, view).px;
    const f = frameOf(p.w / 2, p.h / 2);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const s = (y * 2 * p.w + x * 2) * 4;
        const o = (y * f.w + x) * 4;
        const a = p.d[s + 3];
        f.d[o] = a ? p.d[s] : 22;
        f.d[o + 1] = a ? p.d[s + 1] : 21;
        f.d[o + 2] = a ? p.d[s + 2] : 26;
        f.d[o + 3] = 255;
      }
    }
    show(f, (i % 3) * f.w, Math.floor(i / 3) * f.h);
    g.fillStyle = '#ffffff';
    g.font = '14px monospace';
    g.fillText(`${t.toFixed(3)} s`, (i % 3) * f.w + 8, Math.floor(i / 3) * f.h + 18);
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
