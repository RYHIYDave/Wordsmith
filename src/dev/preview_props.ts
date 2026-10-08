// Dev page: what stands in a dungeon (art/props.ts), on the dungeon's own floor, beside the knight.
//   node tools/preview.mjs src/dev/preview_props.ts shots/art/props.png 600 400 "4"
//   hash = <scale>[:<what>[:<frame>]]   what = new (default) | old | both; frame = which frame of the fire and the portal
// The far row is the new props, the row under it the ones they replace (with "both"), the near
// row what lies on the floor.
import { makeGroundArt } from '../art/ground';
import { makeWarriorArt } from '../art/hero_warrior';
import { makeBestiary } from '../art/bestiary';
import { makeDungeonProps } from '../art/props';
import { makePropArt } from '../art/tiles';
import { makeBodyArt } from '../art/body';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const [scaleArg = '', what = 'new', frameArg = '0'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const frame = Number(frameArg) || 0;
const ground = makeGroundArt();
const fresh = makeDungeonProps();
const old = makePropArt();
const knight = makeWarriorArt({ twoHanded: false });
const beasts = makeBestiary();

const N = 15;
const PAD = 8;
const TOP = 46; // room above the far corner for what stands there
const GW = N * 32 + PAD * 2;
const GH = TOP + N * 16 + PAD * 2;
const cv = document.createElement('canvas');
cv.width = GW * S;
cv.height = GH * S;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${cv.width}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S, S);
g.fillStyle = '#000';
g.fillRect(0, 0, GW, GH);

const ox = PAD + N * 16;
const oy = PAD + TOP;
/** A place by its row down the screen (s = x + y) and how far along it (d = x - y). */
const at = (s: number, d: number): [number, number] => [ox + d * 16, oy + s * 8];
const draw = (sp: Sprite, x: number, y: number): void => {
  g.drawImage(sp.img, Math.round(x) - sp.ax, Math.round(y) - sp.ay, sp.w, sp.h);
};
for (let s = 0; s <= 2 * (N - 1); s++) {
  for (let tx = 0; tx < N; tx++) {
    const ty = s - tx;
    if (ty < 0 || ty >= N) continue;
    draw(ground.floor(tx, ty), ox + (tx - ty) * 16, oy + (tx + ty) * 8);
  }
}

interface Stand {
  s: number;
  d: number;
  sp: Sprite;
  figure?: boolean;
  flat?: boolean;
}
const stands: Stand[] = [];
const row = (s: number, list: (Sprite | null)[], step = 3.2, figure = false): void => {
  const from = -((list.length - 1) * step) / 2;
  list.forEach((sp, i) => {
    if (sp) stands.push({ s, d: from + i * step, sp, figure });
  });
};
const news = [fresh.brazier[frame % 4], fresh.chest, fresh.chestOpen, fresh.barrel, fresh.urn, fresh.pillar];
const olds = [old.brazier[frame % 4], old.chest, old.chestOpen, old.barrel, old.urn, old.pillar];
const men = (list: Sprite[]): void => {
  stands.push({ s: 11, d: -10.4, sp: knight.front.idle[0], figure: true });
  list.forEach((sp, i) => stands.push({ s: 11, d: -7.4 + i * 2.9, sp }));
  stands.push({ s: 11, d: 10.2, sp: beasts.of('skeleton').front.idle[0], figure: true });
};
men(what === 'old' ? olds : news);
const gates = what === 'old' ? old : fresh;
stands.push({ s: 18, d: -4.5, sp: gates.portal[frame % 4] }, { s: 18, d: 4.5, sp: gates.portalOff });
stands.push({ s: 18, d: 0, sp: knight.front.idle[0], figure: true });
if (what === 'both') {
  row(15, olds, 2.9);
  stands.push({ s: 18, d: -9, sp: old.portal[frame % 4] }, { s: 18, d: 9, sp: old.portalOff });
}
// what lies on the floor
const flats = what === 'old' ? [...old.bones, ...old.rubble] : [...fresh.bones, ...fresh.rubble, ...fresh.staves, ...fresh.shards];
flats.forEach((sp, i) => stands.push({ s: 22.6, d: -((flats.length - 1) * 1.45) / 2 + i * 1.45, sp, flat: true }));
if (what === 'both') [...old.bones, ...old.rubble].forEach((sp, i) => stands.push({ s: 26, d: -3 + i * 1.2, sp, flat: true }));
// the wordsmith who fell here
const bodies = makeBodyArt();
if (what !== 'old') stands.push({ s: 24.4, d: -3.2, sp: fresh.fallen, flat: true }, { s: 24.4, d: 3.2, sp: fresh.fallenSearched, flat: true });
if (what !== 'new') stands.push({ s: 20.6, d: -7, sp: bodies.body, flat: true }, { s: 20.6, d: 7, sp: bodies.searched, flat: true });

for (const st of stands) if (st.flat) draw(st.sp, ...at(st.s, st.d));
stands.sort((a, b) => a.s - b.s);
for (const st of stands) {
  if (st.flat) continue;
  const [x, y] = at(st.s, st.d);
  g.fillStyle = 'rgba(0,0,0,0.4)';
  g.beginPath();
  g.ellipse(x, y, st.figure ? 7 : Math.min(12, st.sp.w * 0.36), st.figure ? 3 : Math.min(5, st.sp.w * 0.15), 0, 0, Math.PI * 2);
  g.fill();
  if (st.sp.aura) drawAura(g, st.sp, x, y);
  draw(st.sp, x, y);
}
for (const st of stands) if (!st.flat && st.sp.lights) drawLights(g, st.sp, ...at(st.s, st.d));
(window as unknown as { __ready: boolean }).__ready = true;
