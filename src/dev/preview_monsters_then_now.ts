// Dev page: the monsters before Version 14 and in it, standing beside the knight (who was already
// in the new art), for the owner. His words: "we need the dungeons and mobs brought up to the level
// of the character models".
//   node tools/preview.mjs src/dev/preview_monsters_then_now.ts previews/v14_monsters_before_and_now.png 600 400
//   hash = <scale> (screen pixels per game pixel: default 4)
// Everything is drawn at the size the game draws it (the old guardian was the old brute's picture
// drawn half as big again).

import type { ActorArt } from '../art/actor_types';
import { makeBestiary } from '../art/bestiary';
import type { ClassicFigure as MonsterFigure } from '../art/bestiary';
import { makeBossArt } from '../art/boss';
import { makeWarriorArt } from '../art/hero_warrior';
import { makeGuardianArt, makeMonsterArt } from '../art/monsters';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const S = Number(decodeURIComponent(location.hash.slice(1))) || 4;
const beasts = makeBestiary();
const old = makeMonsterArt();
const oldArt: Record<MonsterFigure, ActorArt> = { skeleton: old.skeleton, archer: old.archer, cultist: old.cultist, bat: old.bat, brute: old.brute, guardian: makeGuardianArt(), warden: makeBossArt() };
const knight = makeWarriorArt({ twoHanded: false }).front.idle[0];

const NAME: Record<MonsterFigure, string> = { skeleton: 'Skeleton', archer: 'Bone Archer', cultist: 'Cultist', bat: 'Cave Bat', brute: 'Brute', guardian: 'Guardian', warden: 'The Warden' };
/** The two lines of each half: the small ones (with your knight, for size), then the big ones. */
const LINES: (MonsterFigure | 'knight')[][] = [['knight', 'skeleton', 'archer', 'cultist', 'bat'], ['brute', 'guardian', 'warden']];

interface Shown {
  sp: Sprite;
  /** How much larger than its picture the game draws it. */
  k: number;
  label: string;
}
function shown(who: MonsterFigure | 'knight', now: boolean): Shown {
  if (who === 'knight') return { sp: knight, k: 1, label: 'your knight' };
  if (now) return { sp: beasts.of(who).front.idle[0], k: 1, label: NAME[who] };
  return { sp: oldArt[who].front.idle[0], k: who === 'guardian' ? 1.5 : 1, label: NAME[who] };
}

const GAP = 12;
const SIDE = 10;
const LABEL = 18;
const TITLE = 30;
/** Room over the tallest head of a line, and under the feet, in game pixels. */
const OVER = 6;
const UNDER = 5;

interface Line {
  cells: Shown[];
  /** Game pixels across, and above and below the floor line. */
  w: number;
  up: number;
  down: number;
}
function lineOf(whos: (MonsterFigure | 'knight')[], now: boolean): Line {
  const cells = whos.map((w) => shown(w, now));
  let w = SIDE * 2 + GAP * (cells.length - 1);
  let up = 0;
  let down = 0;
  for (const c of cells) {
    w += c.sp.w * c.k;
    up = Math.max(up, c.sp.ay * c.k);
    down = Math.max(down, (c.sp.h - c.sp.ay) * c.k);
  }
  return { cells, w: Math.ceil(w), up: Math.ceil(up) + OVER, down: Math.ceil(down) + UNDER };
}
const halves = [false, true].map((now) => LINES.map((l) => lineOf(l, now)));
// (the same room for a line in both halves, so that the two can be compared by eye)
const lineW = Math.max(...halves.flat().map((l) => l.w));
const ups = LINES.map((_, i) => Math.max(halves[0][i].up, halves[1][i].up));
const downs = LINES.map((_, i) => Math.max(halves[0][i].down, halves[1][i].down));
const halfH = TITLE + LINES.reduce((n, _, i) => n + (ups[i] + downs[i]) * S + LABEL, 0) + 8;
const PW = lineW * S;
const PH = halfH * 2 + 6;

const cv = document.createElement('canvas');
cv.width = PW;
cv.height = PH;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.width = `${PW}px`;
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.fillStyle = '#16131c';
g.fillRect(0, 0, PW, PH);

halves.forEach((lines, h) => {
  const now = h === 1;
  let y = h * (halfH + 6);
  g.fillStyle = now ? '#ff7aa8' : '#a8a2b8';
  g.font = 'bold 19px system-ui, -apple-system, Segoe UI, sans-serif';
  g.textBaseline = 'top';
  g.textAlign = 'left';
  g.fillText(now ? 'NOW' : 'BEFORE', 10, y + 7);
  y += TITLE;
  lines.forEach((line, i) => {
    const H = (ups[i] + downs[i]) * S;
    // the dungeon's floor, darker toward the back
    g.fillStyle = '#2e2a36';
    g.fillRect(0, y, PW, H);
    const fade = g.createLinearGradient(0, y, 0, y + H);
    fade.addColorStop(0, 'rgba(14,12,36,0.85)');
    fade.addColorStop(1, 'rgba(14,12,36,0.05)');
    g.fillStyle = fade;
    g.fillRect(0, y, PW, H);
    const floor = y + ups[i] * S;
    // spread the figures evenly across the line
    const used = line.cells.reduce((n, c) => n + c.sp.w * c.k, 0);
    const gap = (lineW - SIDE * 2 - used) / Math.max(1, line.cells.length - 1);
    let x = SIDE;
    for (const c of line.cells) {
      const k = S * c.k;
      const px = Math.round((x + c.sp.ax * c.k) * S);
      g.fillStyle = 'rgba(0,0,0,0.4)';
      g.beginPath();
      g.ellipse(px, floor, c.sp.w * k * 0.34, c.sp.w * k * 0.12, 0, 0, Math.PI * 2);
      g.fill();
      drawAura(g, c.sp, px, floor, k);
      g.drawImage(c.sp.img, px - c.sp.ax * k, floor - c.sp.ay * k, c.sp.w * k, c.sp.h * k);
      drawLights(g, c.sp, px, floor, k);
      g.fillStyle = '#c8c0e0';
      g.font = '13px system-ui, -apple-system, Segoe UI, sans-serif';
      g.textAlign = 'center';
      g.fillText(c.label, Math.round((x + (c.sp.w * c.k) / 2) * S), y + H + 3);
      x += c.sp.w * c.k + gap;
    }
    y += H + LABEL;
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
