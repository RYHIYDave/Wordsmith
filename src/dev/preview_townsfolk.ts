// Dev page: the town's people (art/townsfolk.ts). Every few frames of each one's loop, and of
// what each does now and then, beside the knight for size.
//   node tools/preview.mjs src/dev/preview_townsfolk.ts shots/art/townsfolk.png 1600 900 "4"
//   hash = <scale>[:<who>[:<every>]]   who = all (default) | armourer | mystic | wordsmith | stranger
//                                      every = show one frame in so many (default 3 for all, 1 for one)
import { makeWarriorArt } from '../art/hero_warrior';
import { makeTownsfolk } from '../art/townsfolk';
import type { Townsfolk } from '../art/townsfolk';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const [scaleArg = '', whoArg = 'all', everyArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 4;
const folk = makeTownsfolk();
const knight = makeWarriorArt({ twoHanded: false }).front.idle[0];
const names = (whoArg === 'all' || whoArg === '' ? ['armourer', 'mystic', 'wordsmith', 'stranger'] : [whoArg]) as (keyof Townsfolk)[];
const every = Number(everyArg) || (names.length > 1 ? 3 : 1);

const CW = 62;
const CH = 64;
const FOOT = 54;
const PER = Math.max(4, Math.floor(1560 / (CW * S)));

interface Row {
  label: string;
  frames: Sprite[];
}
const rows: Row[] = [];
for (const who of names) {
  const m = folk[who];
  const pick = (list: Sprite[]): Sprite[] => list.filter((_, i) => i % every === 0);
  rows.push({ label: `${who}: the loop (${m.idle.length} frames, one in ${every} shown)`, frames: [knight, ...pick(m.idle)] });
  rows.push({ label: `${who}: now and then (${m.act.length} frames, one in ${every} shown)`, frames: pick(m.act) });
}
let lines = 0;
for (const r of rows) lines += Math.ceil(r.frames.length / PER);
const W = PER * CW * S + 16;
const H = lines * CH * S + rows.length * 18 + 16;
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${W}px`;
document.body.style.background = '#000';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#0a0818';
g.fillRect(0, 0, W, H);
let y = 8;
for (const r of rows) {
  g.fillStyle = '#7af8f0';
  g.font = '12px monospace';
  g.textBaseline = 'top';
  g.fillText(r.label, 8, y + 2);
  y += 18;
  r.frames.forEach((sp, i) => {
    const cx = 8 + (i % PER) * CW * S;
    const cy = y + Math.floor(i / PER) * CH * S;
    g.save();
    g.translate(cx, cy);
    g.scale(S, S);
    // (the floor's own blue, and a darker band where the floor would be in shade)
    g.fillStyle = i % 2 === 0 ? '#1a1848' : '#141238';
    g.fillRect(0, 0, CW - 1, CH - 1);
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.beginPath();
    g.ellipse(CW / 2, FOOT, 7, 3, 0, 0, Math.PI * 2);
    g.fill();
    if (sp.aura) drawAura(g, sp, CW / 2, FOOT);
    g.drawImage(sp.img, CW / 2 - sp.ax, FOOT - sp.ay, sp.w, sp.h);
    if (sp.lights) drawLights(g, sp, CW / 2, FOOT);
    g.restore();
  });
  y += Math.ceil(r.frames.length / PER) * CH * S;
}
console.log(`sheet ${W}x${H}`);
(window as unknown as { __ready: boolean }).__ready = true;
