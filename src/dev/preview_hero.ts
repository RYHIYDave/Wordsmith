// Dev preview: every frame of one hero's rig, so the animation can be checked by eye.
//   node tools/preview.mjs src/dev/preview_hero.ts shots/hero.png 1600 1200 "warrior"
//   hash = <hero>[:<what>[:<scale>[:<per row>[:<every>]]]]
//     hero    = warrior | warrior2 (the great sword) | ranger | mage
//     what    = all (default: an overview) | front | back | idle | walk | attack | heavy | leap |
//               idleA | idleB | <view>-<anim>   (attack, heavy and leap show their whole timeline)
//     scale   = screen pixels per picture pixel (default 2 for all, 3 otherwise)
//     per row = frames in a row (default 8)
//     every   = show one frame in so many (default 1)
// Each cell shows the frame where the game would put it (by its anchor), on the colour of the
// style's world and on the colour of the old dungeon floor, with the frame's lights added, and a
// mark where each tail is fixed (the tails themselves move: see tools/hero_gif.mjs).

import type { ActorArt, AnimSet } from '../art/actor_types';
import { makeMageArt } from '../art/hero_mage';
import { makeRangerArt } from '../art/hero_ranger';
import { makeWarriorArt } from '../art/hero_warrior';
import { GRAIN, KAX, KAY, KH, KW } from '../art/kit';
import type { Sprite } from '../engine/px';

const [who = 'warrior', what = 'all', scaleArg = '', rowArg = '', everyArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || (what === 'all' ? 2 : 3);
const perRow = Number(rowArg) || 8;
const every = Math.max(1, Number(everyArg) || 1);

function artOf(name: string): ActorArt {
  if (name === 'warrior2') return makeWarriorArt({ twoHanded: true });
  if (name === 'ranger') return makeRangerArt();
  if (name === 'mage') return makeMageArt();
  return makeWarriorArt({ twoHanded: false });
}
const art = artOf(who);

/** The part of the kit's canvas worth showing, in picture pixels. */
const CROP = { x: 8, y: 6, w: KW - 12, h: KH - 8 };
const CW = CROP.w * S;
const CH = CROP.h * S;
const GAP = 6;

interface Row {
  label: string;
  frames: Sprite[];
  step: number;
}
const rows: Row[] = [];
const views: [string, AnimSet][] = [['front', art.front], ['back', art.back]];
for (const [vn, set] of views) {
  const lists: [string, Sprite[] | undefined, number][] = [
    ['idle', set.idle, 1],
    ['walk', set.walk, 1],
    ['attack', set.clips?.attack?.frames ?? set.attack, every],
    ['heavy', set.clips?.heavy?.frames ?? set.heavy, every],
    ['leap', set.clips?.leap?.frames ?? set.leap, every],
    ['idleA', set.clips?.idleA?.frames, every],
    ['idleB', set.clips?.idleB?.frames, every],
  ];
  for (const [an, frames, step] of lists) {
    const key = `${vn}-${an}`;
    if (what !== 'all' && what !== vn && what !== an && what !== key) continue;
    if (what === 'all' && (an === 'idleA' || an === 'idleB')) continue;
    if (frames) rows.push({ label: `${who} ${vn} ${an} (${frames.length} frames${step > 1 ? `, every ${step}` : ''})`, frames: Array.from(frames).filter((_, i) => i % step === 0), step });
  }
}

let lines = 0;
for (const r of rows) lines += Math.ceil(r.frames.length / perRow);
const W = perRow * (CW + GAP) + GAP;
const H = lines * (CH + GAP) + GAP + rows.length * 22;

const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.overflow = 'auto';
document.documentElement.style.overflow = 'auto';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#16131c';
g.fillRect(0, 0, W, H);

function tint(hex: string, a: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

let y = GAP;
for (const r of rows) {
  g.fillStyle = '#ffd866';
  g.font = 'bold 15px system-ui, sans-serif';
  g.textBaseline = 'top';
  g.fillText(r.label, GAP, y + 2);
  y += 22;
  r.frames.forEach((sp, i) => {
    const col = i % perRow;
    const line = Math.floor(i / perRow);
    const x0 = GAP + col * (CW + GAP);
    const y0 = y + line * (CH + GAP);
    // the style's own world and the old dungeon floor, cell about
    g.fillStyle = i % 2 === 0 ? '#0b0a1e' : '#2e2a36';
    g.fillRect(x0, y0, CW, CH);
    // the floor line and the anchor
    const ax = x0 + (KAX - CROP.x) * S;
    const ay = y0 + (KAY - CROP.y) * S;
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.fillRect(x0, ay, CW, 1);
    g.fillRect(ax, y0, 1, CH);
    g.save();
    g.beginPath();
    g.rect(x0, y0, CW, CH);
    g.clip();
    // (a frame is cut down to what is painted: it is laid down by its anchor, as the game does)
    const left = ax - sp.ax * GRAIN * S;
    const top = ay - sp.ay * GRAIN * S;
    g.drawImage(sp.img, left, top, sp.w * GRAIN * S, sp.h * GRAIN * S);
    g.globalCompositeOperation = 'lighter';
    for (const l of sp.lights ?? []) {
      const lx = left + l.x * GRAIN * S;
      const ly = top + l.y * GRAIN * S;
      const rr = l.r * GRAIN * S;
      const grd = g.createRadialGradient(lx, ly, 0, lx, ly, rr);
      grd.addColorStop(0, tint(l.color, l.a ?? 0.5));
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(lx - rr, ly - rr, rr * 2, rr * 2);
    }
    g.globalCompositeOperation = 'source-over';
    for (const t of sp.tails ?? []) {
      g.fillStyle = t.over ? '#ffe070' : '#ff7aa8';
      g.fillRect(left + t.x * GRAIN * S - 1, top + t.y * GRAIN * S - 1, 3, 3);
    }
    g.restore();
    g.fillStyle = '#8a84a0';
    g.font = '12px system-ui, sans-serif';
    g.fillText(String(i * r.step), x0 + 4, y0 + 3);
  });
  y += Math.ceil(r.frames.length / perRow) * (CH + GAP);
}

void KH;
(window as unknown as { __ready: boolean; __size: { w: number; h: number } }).__size = { w: W, h: H };
(window as unknown as { __ready: boolean }).__ready = true;
