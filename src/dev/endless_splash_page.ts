// ENDLESS MODE'S SPLASH, PAINTED, ON A PAGE OF ITS OWN, FOR ITS PICTURES AND FILM (a mock-up tool, not the game:
// tools/endless_splash_film.mjs builds it and photographs it). The same picture, moment and letters as the game draws
// (ui/endless_splash_draw.ts), on a canvas of the size asked for in game pixels (#w=507&h=234), any moment of it asked for by
// its time: window.__splash(t).
import { drawEndlessSplashArt, readyEndlessSplash } from '../ui/endless_splash_draw';

const q = new URLSearchParams(location.hash.slice(1));
const w = Number(q.get('w') || 507);
const h = Number(q.get('h') || 234);
const cv = document.createElement('canvas');
cv.width = w * 2;
cv.height = h * 2;
cv.style.cssText = `display:block;position:absolute;left:0;top:0;width:${w * 2}px;height:${h * 2}px;image-rendering:pixelated`;
document.body.appendChild(cv);
const g = cv.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
g.setTransform(2, 0, 0, 2, 0, 0);
g.imageSmoothingEnabled = false;
const t0 = performance.now();
readyEndlessSplash();
const win = window as unknown as { __splash(t: number): void; __ready: boolean; __paintMs: number };
win.__paintMs = Math.round(performance.now() - t0);
win.__splash = (t: number): void => {
  // (the game behind it, as a floor might be: not black, so that the dark coming up is seen)
  g.fillStyle = '#2a2334';
  g.fillRect(0, 0, w, h);
  drawEndlessSplashArt(g, t, w, h);
};
win.__splash(3);
win.__ready = true;
