// Dev page: how much room the films' frames would take cut down to what is painted in each.
//   node tools/preview.mjs src/dev/measure_crop.ts shots/m.png 100 100 "4"
import { wardenMoments } from '../art/floor1';
import { headsmanMoments } from '../art/floor2';
import { chainedMoments } from '../art/floor3';
import { ossuaryMoment } from '../art/floor4';
import { lairMoment } from '../art/floor5_moments';
import type { Moment } from '../art/floorkit';
import { cageDown, cageUp } from '../art/shaft';
import { stairwellOpens } from '../art/stairwell_open';
import { CRYPT_FLOORS } from '../art/crypt';
import type { Sprite } from '../engine/px';

const k = Number(decodeURIComponent(location.hash.slice(1)) || 1);
const mb = (n: number): string => (n / 1048576).toFixed(1);
function cut(list: Sprite[]): [number, number, number] {
  let full = 0;
  let cropped = 0;
  const t0 = performance.now();
  const seen = new Set<Sprite>();
  for (const s of list) {
    if (seen.has(s)) continue;
    seen.add(s);
    const w = s.img.width;
    const h = s.img.height;
    full += w * h * 4;
    const d = (s.img.getContext('2d') as CanvasRenderingContext2D).getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] !== 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= x0) cropped += (x1 - x0 + 1) * (y1 - y0 + 1) * 4;
  }
  return [full, cropped, performance.now() - t0];
}
const all = (m: Moment): Sprite[] => [...m.frames, ...(m.before ?? []), ...(m.after ?? []), ...(m.right ? [...m.right.frames, ...(m.right.before ?? []), ...(m.right.after ?? [])] : [])];
setTimeout(() => {
  const say = (name: string, list: Sprite[]): void => {
    const [f, c, ms] = cut(list);
    console.log(`measure ${name}: ${mb(f)} MB whole, ${mb(c)} MB cut down (${((c / f) * 100).toFixed(0)}%), ${ms.toFixed(0)} ms to look`);
  };
  if (k === 1) wardenMoments().forEach((m) => say(m.name, all(m)));
  if (k === 2) headsmanMoments().forEach((m) => say(m.name, all(m)));
  if (k === 3) chainedMoments().forEach((m) => say(m.name, all(m)));
  if (k === 4) [0, 1, 2].forEach((n) => { const m = ossuaryMoment(n); say(m.name, all(m)); });
  if (k === 5) [0, 1, 2].forEach((n) => { const m = lairMoment(n); say(m.name, all(m)); });
  if (k === 6) { const d = cageDown(); say('cage down', [...all(d.m), ...d.layers.back, ...d.layers.front]); const u = cageUp(); say('cage up', [...all(u.m), ...u.layers.back, ...u.layers.front]); say('stair', all(stairwellOpens(CRYPT_FLOORS[0], 'x', [0, 0]))); }
  (window as unknown as { __ready: boolean }).__ready = true;
}, 50);
